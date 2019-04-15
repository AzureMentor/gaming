using System.Collections.Generic;
using UnityEngine;
using HoloToolkit.Unity;


public class EatEnemies : Singleton<EatEnemies>
{
    private List<GameObject> _listOfHeldEnemies = new List<GameObject>();
    public float MinDistanceFromPlayerHead;
    public Transform EatingPfx;
    private float _loudness;
    public float EatingLoudnessTrigger;


    private void Update()
    {
        _loudness = MicControlC.Instance.loudness;
        if (_loudness > EatingLoudnessTrigger)
        {
            EatEnemyIfClose();
        }
    }

    public void AddEnemyToList(GameObject enemy)
    {
        _listOfHeldEnemies.Add(enemy);
    }

    public void RemoveEnemyFromList(GameObject enemy)
    {
        _listOfHeldEnemies.Remove(enemy);
    }

    public void EatEnemyIfClose()
    {
        foreach (GameObject heldEnemy in _listOfHeldEnemies.ToArray())
        {
            float distance = Vector3.Distance(transform.position, heldEnemy.transform.position);

            if (distance < MinDistanceFromPlayerHead && 
                heldEnemy.GetComponent<MakeToxic>())
            {
                if (heldEnemy.GetComponent<MakeToxic>().GetIsToxic() == true)
                {
                    ControlBreathWeapon.Instance.BeginSequence();
                }

                Instantiate(EatingPfx, heldEnemy.transform.position, Quaternion.identity);
                Destroy(heldEnemy);
                RemoveEnemyFromList(heldEnemy);
            }
        }
    }

}