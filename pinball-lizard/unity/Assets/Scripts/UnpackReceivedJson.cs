using UnityEngine;
using HoloToolkit.Unity;


public class UnpackReceivedJson : Singleton<UnpackReceivedJson>
{

    public SpawnIceLiceForSwarm SpawnIceLiceScript;
    public Transform FormationPrefab;
    public FireFlyManager FireflyManagerScript;
    public ArachnotankManager TankManagerScript;


    public void UnpackJsonString(string receivedString)
    {
        JsonForAzure receivedMessage = JsonUtility.FromJson<JsonForAzure>(receivedString);

        switch (receivedMessage.type)
        {
            // player
            case 0:
                // current player receives score from Azure
                if (receivedMessage.spec == 0 && receivedMessage.action == 2)
                {
                    ScoreSingleton.Instance.SetPlayerScore(receivedMessage.payload.playerScore);
                }
                break;
            // enemy
            case 1:
                DoEnemyAction(receivedMessage);
                break;

            // init
            case 4:
                if (receivedMessage.action == 0)
                {
                    WebSocketClientSingleton.Instance.SetInstanceId(receivedMessage.payload.instance);
                }
                break;
        }
    }

    private void DoEnemyAction(JsonForAzure receivedMessage)
    {
        switch (receivedMessage.spec)
        {
            // Ice Lice
            case 1:
                // transform into toxic
                if (receivedMessage.action == 9)
                {
                    DictionaryOfIds.Instance.GetGameObject(receivedMessage.payload.npcId).SendMessage(Constants.METHOD_MAKE_TOXIC, SendMessageOptions.DontRequireReceiver);
                }
                break;

            // Arachnotank
            case 2:
                // Barrage
                if (receivedMessage.action == 4)
                {
                    TankManagerScript.BeginBarrage();
                }
                break;

            // FireFly
            case 3:
                //Airstrike
                if (receivedMessage.action == 4)
                {
                    FireflyManagerScript.BeginAirstrike();
                }
                break;

            // Formation
            case 4:
                DoFormationAction(receivedMessage);
                break;
        }
    }

    private void DoFormationAction(JsonForAzure receivedMessage)
    {
        switch (receivedMessage.action)
        {
            // spawn
            case 0:
                Vector3 spawnPosition = receivedMessage.payload.waypoint;
                GameObject newFormation = Instantiate(FormationPrefab, spawnPosition, Quaternion.identity).gameObject;
                newFormation.SendMessage(Constants.METHOD_FORMATION_INIT, receivedMessage.payload.formationId, SendMessageOptions.DontRequireReceiver);
                SpawnIceLiceScript.SpawnEnemiesForFormation(receivedMessage.payload.formationId, receivedMessage.payload.listOfMembers);
                break;

            // split
            case 4:
                Vector3 primaryFormationPosition = DictionaryOfIds.Instance.GetGameObject(receivedMessage.payload.formationId).transform.position;
                DictionaryOfIds.Instance.RemoveFormation(receivedMessage.payload.formationId);

                GameObject recreatedPrimaryFormation = Instantiate(FormationPrefab, primaryFormationPosition, Quaternion.identity).gameObject;
                recreatedPrimaryFormation.SendMessage(Constants.METHOD_FORMATION_INIT, receivedMessage.payload.formationId, SendMessageOptions.DontRequireReceiver);
                recreatedPrimaryFormation.SendMessage(Constants.METHOD_FORMATION_ASSIGN, receivedMessage.payload.listOfMembers, SendMessageOptions.DontRequireReceiver);
                GameObject secondaryFormation = Instantiate(FormationPrefab, receivedMessage.payload.waypoint, Quaternion.identity).gameObject;
                secondaryFormation.SendMessage(Constants.METHOD_FORMATION_INIT, receivedMessage.payload.secondaryFormationId, SendMessageOptions.DontRequireReceiver);
                secondaryFormation.SendMessage(Constants.METHOD_FORMATION_ASSIGN, receivedMessage.payload.secondaryListOfMembers, SendMessageOptions.DontRequireReceiver);
                break;

            // merge
            case 5:
                Vector3 mergedPosition = DictionaryOfIds.Instance.GetGameObject(receivedMessage.payload.formationId).transform.position;
                DictionaryOfIds.Instance.RemoveFormation(receivedMessage.payload.formationId);
                DictionaryOfIds.Instance.RemoveFormation(receivedMessage.payload.secondaryFormationId);

                GameObject mergedFormation = Instantiate(FormationPrefab, mergedPosition, Quaternion.identity).gameObject;
                mergedFormation.SendMessage(Constants.METHOD_FORMATION_INIT, receivedMessage.payload.formationId, SendMessageOptions.DontRequireReceiver);
                mergedFormation.SendMessage(Constants.METHOD_FORMATION_ASSIGN, receivedMessage.payload.listOfMembers, SendMessageOptions.DontRequireReceiver);
                break;

            // new waypoints for formation (but not for members)
            case 7:
                GameObject formation = DictionaryOfIds.Instance.GetGameObject(receivedMessage.payload.formationId);
                if (formation != null)
                {
                    formation.SendMessage(Constants.METHOD_FORMATION_POSITION, receivedMessage.payload.waypoint, SendMessageOptions.DontRequireReceiver);
                }
                break;

            // scatter
            case 8:
                receivedMessage.payload.listOfMembers.ForEach(id =>
                {
                    GameObject formationForScatter = DictionaryOfIds.Instance.GetGameObject(id);
                    formationForScatter.SendMessage(Constants.METHOD_SCATTER, SendMessageOptions.DontRequireReceiver);
                });
                break;
        }
    }
}
