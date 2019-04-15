using System;
using UnityEngine;
using BestHTTP.WebSocket;
using HoloToolkit.Unity;


public class WebSocketClientSingleton : Singleton<WebSocketClientSingleton>
{
     private const string address = "wss://<INTERNAL_RELAY_IP>:8085/ws"; // Deployment Guide
    private WebSocket webSocket;
    private int type;
    private int spec;
    private int action;
    private string instance;
    private string auth = "<INTERNAL_RELAY_AUTH_TOKEN>";      // Deployment Guide
    private string payloadPlayerName = "Player Name";


    private void Update()
    {
        if (Input.GetKey(KeyCode.D))
        {
            SendDestroyMessage();
        }
    }

    private void Start()
    {
        webSocket = new WebSocket(new Uri(address))
        {
            StartPingThread = true
        };

        webSocket.OnOpen += OnOpen;
        webSocket.OnMessage += OnMessageReceived;
        webSocket.OnClosed += OnClosed;
        webSocket.OnError += OnError;

        webSocket.Open();
    }

    private JsonForAzure BuildMessage(int type, int spec, int action, Payload payload)
    {
        var message = new JsonForAzure
        {
            instance = instance,
            auth = new Auth() { key = auth },
            type = type,
            spec = spec,
            action = action,
            payload = payload
        };
        return message;
    }

    private string BuildMessageString(int type, int spec, int action, Payload payload)
    {
        return JsonUtility.ToJson(BuildMessage(type, spec, action, payload));
    }

    protected override void OnDestroy()
    {
        if (webSocket != null)
        {
            SendDestroyMessage();
            webSocket.Close();
        }
    }

    /// <summary>
    /// Set by UnpackReceivedJson singleton
    /// </summary>
    public void SetInstanceId(string id)
    {
        Debug.Log("instance id = " + id);
        instance = id;
    }


    #region Outgoing Messages

    public void SendPlayerPositionMessage(Vector3 playerPosition)
    {
        var payload = new Payload() { waypoint = playerPosition };
        string jsonString = BuildMessageString(
            Constants.MSG_TYPE_PLAYER,
            Constants.MSG_PLAYER_CURRENT,
            Constants.MSG_ACTION_POSITION,
            payload
            );
        webSocket.Send(jsonString);
    }

    public void SendDeadNpcMessage(string formationId, string npcId)
    {
        var payload = new Payload()
        {
            npcId = npcId,
            formationId = formationId
        };

        string jsonString = BuildMessageString(
            Constants.MSG_TYPE_ENEMY,
            Constants.MSG_NPC_ALL,
            Constants.MSG_ACTION_DIE,
            payload);

        webSocket.Send(jsonString);
    }

    public void SendStartMessage()
    {
        var payload = new Payload();
        string jsonString = BuildMessageString(
            Constants.MSG_TYPE_INIT,
            Constants.MSG_ACTION_INIT,
            Constants.MSG_ACTION_START,
            payload);
        webSocket.Send(jsonString);
    }

    public void SendDestroyMessage()
    {
        var payload = new Payload();
        string jsonString = BuildMessageString(
            Constants.MSG_TYPE_DESTROY,
            Constants.MSG_ACTION_INIT,
            Constants.MSG_ACTION_INIT,
            payload);
        webSocket.Send(jsonString);
        Debug.Log("Sent DESTROY message");
    }

    private void SendInitMessage()
    {
        Debug.Log("webSocketClient send init message");

        var payload = new Payload()
        {
            playerName = payloadPlayerName,
            enableMixer = true
        };
        string jsonString = BuildMessageString(
            Constants.MSG_TYPE_INIT,
            Constants.MSG_ACTION_INIT,
            Constants.MSG_ACTION_INIT,
            payload);
        webSocket.Send(jsonString);
    }

    public void AddToPlayerScore(int amountToAdd)
    {
        var payload = new Payload()
        {
            playerScore = amountToAdd
        };
        string jsonString = BuildMessageString(
            Constants.MSG_TYPE_PLAYER,
            Constants.MSG_PLAYER_CURRENT,
            Constants.MSG_ACTION_ADD_SCORE,
            payload);
        webSocket.Send(jsonString);

        // request updated player score
        string recScoreString = BuildMessageString(
            Constants.MSG_TYPE_PLAYER,
            Constants.MSG_PLAYER_CURRENT,
            Constants.MSG_ACTION_GET_SCORE,
            new Payload());
        webSocket.Send(recScoreString);
    }

    public void SendIceLiceSpawnRequest()
    {
        string jsonString = BuildMessageString(
            Constants.MSG_TYPE_ENEMY,
            Constants.MSG_NPC_ICE_LICE,
            Constants.MSG_ACTION_SPAWN,
            new Payload());
        webSocket.Send(jsonString);
    }

    public void SendWaypointClearMessage(string npcId)
    {
        var payload = new Payload()
        {
            npcId = npcId
        };

        string jsonString = BuildMessageString(
            Constants.MSG_TYPE_ENEMY,
            Constants.MSG_NPC_ALL,
            Constants.MSG_FORMATION_DIE,
            payload);
        webSocket.Send(jsonString);
    }

    # endregion

    #region WebSocket Event Handlers

    void OnOpen(WebSocket ws)
    {
        SendInitMessage();

    }

    void OnMessageReceived(WebSocket ws, string message)
    {
        UnpackReceivedJson.Instance.UnpackJsonString(message);
    }

    void OnClosed(WebSocket ws, UInt16 code, string message)
    {
        webSocket = null;
    }

    void OnError(WebSocket ws, Exception ex)
    {
        string errorMsg = string.Empty;

#if !UNITY_WEBGL || UNITY_EDITOR
        if (ws.InternalRequest.Response != null)
            errorMsg = string.Format("Status Code from Server: {0} and Message: {1}", ws.InternalRequest.Response.StatusCode, ws.InternalRequest.Response.Message);
#endif
        Debug.Log(errorMsg);
        webSocket = null;
    }

    #endregion
}
