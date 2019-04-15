Unity
=====

<span id="_Download_and_Install" class="anchor"><span id="_Toc519166875" class="anchor"></span></span>Install Windows SDK
-------------------------------------------------------------------------------------------------------------------------

Download and install the Windows SDK
[here.](https://developer.microsoft.com/en-US/windows/downloads/windows-10-sdk)

![](/media/image107.png)

Turn on developer mode
----------------------

Go to **Start** **-&gt;** **Settings -&gt; Update & Security -&gt; For
developers -&gt; Use developer features** and select **Devloper mode**.

![](/media/image108.png)

![](/media/image109.png)

Install Visual Studio 2017
--------------------------

Install and download Visual Studio 2017
[here](https://visualstudio.microsoft.com/downloads/?utm_medium=microsoft&utm_source=docs.microsoft.com&utm_campaign=button+cta&utm_content=download+vs2017).

Ensure the following workloads are installed.

![](/media/image110.png) ![](/media/image111.png)

Download and install correct version of Unity editor
----------------------------------------------------

To compile this application, the [mixed-reality version of Unity
(MRTP4)](http://beta.unity3d.com/download/b1565bfe4a0c/UnityDownloadAssistant.exe)
used in the development of Pinball Lizard is required. It’s a special
Unity build with the mixed-reality toolkit built in. Install Unity by
selecting **Windows Store options** and accepting defaults for other
options in the Wizard. Once installed, sign into Unity.

![](/media/image112.png)

Open Unity.

Once signed in, click **↑ Open** and locate and open the Pinball Lizard
Unity project.

![](/media/image113.png)

<span id="_Download_Source_Code" class="anchor"><span id="_Azure_Functions" class="anchor"><span id="_Open_the_Pinball" class="anchor"><span id="_Toc519166877" class="anchor"></span></span></span></span>Open Pinball Lizard Unity project
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

The Unity code can be found under the Unity folder at the root of the
Pinball Lizard source code. It is a copy of the production code that was
showcased at the Game Developers Conference (GDC) 2018. Open the project
folder with the Unity editor, and then load **Basic Scene**.

![](/media/image114.png)

Now you can see all of the game objects and scripts created during the
development of Pinball Lizard. Any modifications here would deviate from
the original game experienced at GDC 2018.

From here, provided you have a mixed-reality headset plugged in, you can
press the **Play** button at the top middle of the Unity 3D editor and
interact with the Unity part of the game.

**\*\*\*Note:** At this point in the guide, the game’s backend is not
functional, which means the game will not play as intended. You will
only be able to interact with the tutorial screen.

<span id="_Activate_HTTP_Pro" class="anchor"><span id="_Toc519166878" class="anchor"></span></span>Activate Best HTTP (Pro)
---------------------------------------------------------------------------------------------------------------------------

Pinball Lizard uses Best HTTP (Pro) to facilitate the connection between
Unity and Azure. Without this plug-in, the game will be stuck in
tutorial mode. To use this plug-in, a license is required. If you want
to deploy this yourself, you will need to obtain a license key.

Learn more or [download Best
HTTP](https://assetstore.unity.com/packages/tools/network/best-http-10872).
You can also search for and download Best HTTP from within Unity by
searching for it in the Asset Store.

![](/media/image115.png)

Once you have downloaded the Best HTTP Pro asset, import it into your
Pinball Lizard Unity project.

![](/media/image116.png)

![](/media/image117.png)

\*\*\*Important\*\*\* Right-click the parent Assets folder and reimport
all assets.

![](/media/image118.png)

<span id="_Configuring_Unity_Game" class="anchor"><span id="_Toc519166879" class="anchor"></span></span>Configure Unity Game Engine to connect to Azure Functions
-----------------------------------------------------------------------------------------------------------------------------------------------------------------

The Unity Game Engine needs to communicate with the Azure Functions
endpoint and must be aware of it before the game is built into a
Universal Windows Platform (UWP) application. If this is not enabled,
the application will never interact with the enemies.

You can find the file that needs to be modified at the following
location:

```<pinball lizard root>\unity\Assets\Scripts\WebSocketClientSingleton.cs```

![](/media/image119.png)

Modify the following values and press **CTRL + s** to save:
```
 private const string address = "wss://<INTERNAL\_RELAY_IP>:8085/ws"
 private string auth = "<INTERNAL_RELAY_AUTH_TOKEN>
```
**\*\*\*Note**: These values can be found in your Function App settings.

![](/media/image120.png)

**\*\*\*Note:** The Unity Game Engine needs to be aware of the Azure
Functions endpoint prior to building, either through local Azure
Functions (using 127.0.0.1) or Azure Functions running on Azure.

<span id="_Building_Pinball_Lizard" class="anchor"><span id="_Toc519166880" class="anchor"></span></span>Build Pinball Lizard for mixed reality
-----------------------------------------------------------------------------------------------------------------------------------------------

In order to install Pinball Lizard in a reliable way, you need to build
the code into a UWP application that is specifically targeted for the
mixed-reality headset.

The build settings must be set in Unity as follows:

-   **Platform**: Windows Universal Platform
    -   Target device: Any device
    -   Build type: D3D
-   **SDK**: Latest installed
    -   Build and run on: Local machine
-   **Copy references**: True (check box)

You can optionally enable debugging to see what is happening as the game
is being played.

Learn more about [mixed
reality](https://docs.microsoft.com/en-us/windows/mixed-reality/unity-development-overview).

Test and run Pinball Lizard in Unity
------------------------------------

Press play to start the game. Make sure to keep headset at eye-level
when you press play. Press the spacebar when the cursor is in the game
window within Unity to generate a new instance.

![](/media/image121.png)

<span id="_Holotoolkit" class="anchor"><span id="_Mixed_Reality" class="anchor"><span id="_Toc519166881" class="anchor"></span></span></span>Choose mixed-reality tools
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------

### Samsung Odyssey 

Pinball Lizard was developed using the Samsung Odyssey with motion
controllers, although the game will work on other mixed-reality
headsets. One caveat is that it requires motion controllers.

### HoloToolkit

Microsoft has merged development of HoloLens into its mixed-reality
platform. Note, however, that we used an older version of the
HoloToolkit, specifically the MRTP4 development build. This gave us the
additional functionality we needed to complete this project.

<span id="_Build_UWP_Application" class="anchor"><span id="_Toc519166884" class="anchor"></span></span>Build UWP application using Visual Studio
------------------------------------------------------------------------------------------------------------------------------------------------

With the C\# application code built, you can now use Visual Studio to
create and deploy the UWP application. This installs the Pinball Lizard
application into the mixed-reality portal on your dev machine.

In Visual Studio, be sure to change the build configuration (in the top
middle of the screen) to **X64 Release** and then build toward the local
machine.

Learn more about the [UWP application and Visual
Studio](https://docs.microsoft.com/en-us/windows/uwp/packaging/packaging-uwp-apps).

<span id="_Toc519166892" class="anchor"><span id="_Toc519166885" class="anchor"></span></span>Learn more about Azure gaming
===========================================================================================================================

When you’re planning your game, don’t forget to visit
[azure.com/gaming](https://indigoslate.sharepoint.com/sites/pwa/VR%20Game%20Development%20%20Launch%20%5bAzure%20Gaming%5d/Shared%20Documents/Working/GitHub%20step%20by%20step/azure.com/gaming)
to learn more about how Azure can help. See how easy it is to build,
launch, and scale across any platform with Azure. You can start a free
trial with \$200 in credit by visiting
[azure.com/free](https://indigoslate.sharepoint.com/sites/pwa/VR%20Game%20Development%20%20Launch%20%5bAzure%20Gaming%5d/Shared%20Documents/Working/GitHub%20step%20by%20step/azure.com/free).

<br><br>
[PREV: Set up containers](/docs/03_Set_up_containers.md)

[NEXT: Appendix](/docs/05_Appendix.md)