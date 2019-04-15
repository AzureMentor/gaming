<span id="_Node.js_Applications" class="anchor"><span id="_Toc519166870" class="anchor"></span></span>Set up containers
=======================================================================================================================

<span id="_Azure_container_instances" class="anchor"><span id="_Toc519166871" class="anchor"></span></span>Azure Container Instances
------------------------------------------------------------------------------------------------------------------------------------

Container groups allow you to have containers grouped together on one
host, enabling individual services to communicate without the need for
external DNS or authentication.

\*\*\*NOTE: Since we are using container groups, we will be assigning
localhost/loopback addressing individual containers, with the exception
of the Internal-Relay container.

![](/media/image67.png)

### <span id="_Configure_and_Deploy" class="anchor"><span id="_Toc519166893" class="anchor"><span id="_Toc519166872" class="anchor"></span></span></span>Install Docker

Download and install Docker using this
[link](https://docs.docker.com/docker-for-windows/install/).

**\*\*Note**: This will require hardware virtualization to be enabled.
Consult instructions specific to your motherboard if your run into
errors.

### Run Docker containers locally

With Docker, you do not need to install and run each node application by
hand. Docker will assist you by installing the Node.js platform inside
each container.

Each part of the source code is separated into different parts of the
large machine that is Pinball Lizard. The pieces that need to run as
Docker containers with Node.js embedded will contain a Dockerfile at the
root of the directory and are as follows:

-   Commander
    -   Provides gameplay functionality for Pinball Lizard. Game engine
        controls in-game Ice Lice formations and movements and commands
        air strikes and tank barrages.
-   Internal-relay
    -   Routes external calls to relay container, which interprets
        internal messages into API calls for other REST endpoints.
    -   Offloads handling of requests to optimize game response time.
-   Mixer
    -   Node application that establishes a connection with the Mixer
        streaming servers and handles the interactivity between viewer
        and streamer.
-   PlayFab
    -   Provides PlayFab reporting functionality for Pinball Lizard.
-   Proxy-router
    -   Node application that manages inbound and outbound
        communications across the game.

#### <span id="_SSL_Certs" class="anchor"><span id="_Toc519166891" class="anchor"><span id="_Toc519166894" class="anchor"></span></span></span>SSL Certs

Each node application has a folder called **SSL** at its root that
contains two certificate files. These must be generated and placed here
prior to launching the node application. We will be using OpenSSL,
Windows Subsystem for Linux, and Ubuntu to generate the certs. If you do
not already have WSL installed, follow [these
instructions](https://docs.microsoft.com/en-us/windows/wsl/install-win10)
for Windows 10, then download Ubunutu from the Windows Store.

If you already have PowerShell open and WSL installed, you can type bash
to switch prompts. Otherwise, press **Win + R** then type bash to launch
the prompt and run the following commands in your pinball-lizard
directory:

![](/media/image68.png)

![](/media/image69.png)
Navigate to the **pinball-lizard directory** and run the following
commands to generate a keypair and cert:

openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days
365

![](/media/image70.png)

Copy the **key.pem** and **cert .pem** files you generated to the **ssl
folder** of each container (commander, inter-relay, mixer, playfab and
proxy-router).

![](/media/image71.png)

Learn more about [how to create a PEM file from an SSL
certificate](https://stackoverflow.com/questions/991758/how-to-get-pem-file-from-key-and-crt-files).

#### Config files

Each container has a **config.json** file located in the **src\\config**
folder. This file will start off with three entries: SSL\_PASSPHRASE,
CONFIG\_ENDPOINT\_URI, and CONFIG\_ENDPOINT\_KEY. These values are
required in order to start the node application contained within. Once
the app is started, it will download the extended configuration from the
specified endpoint.

Edit the config file with **SSL passphrase** you used in the previous
step and your **Config Endpoint** values.

![](/media/image72.png)

### Create an Azure Container Registry

Log in to the Azure portal and click **+Create a resource** **-&gt;
Containers -&gt; Container Registry**.

![](/media/image73.png)

**Name** the registry and choose your existing **Resource group.**

![](/media/image74.png)

Once you have created the Container Registry, navigate to **Settings
-&gt; Access Keys** and record the **Login Server**, **Username**, and
**Password** for later use.

**\*\*\*NOTE:** You need to click **Enable** under **Admin User** to see
username and password**.** Your values will be unique to your
environment.

![](/media/image75.png)

### Create container images

For all containers, run the following command inside the container
folder to create the container image:

```docker build -t <container\_name>```

![](/media/image76.png)

![](/media/image77.png)

Run the following command to see the newly created images:

```docker images```

![](/media/image78.png)

Before you move on to tagging the images, run the Docker container for
all containers to ensure there are no errors before proceeding. Run the
following command to start the container:

```docker run <container\_name>```

![](/media/image79.png)

![](/media/image80.png)

Press **CTRL + C** to exit.

### Tag and push images to registry

Now, tag the images with the loginServer of the Container Registry.

```docker tag <image\_name>```
&lt;acrName&gt;.azurecr.io/&lt;image\_name&gt;

![](/media/image81.png)

Run the following command to verify the newly tagged images:

```docker images```

![](/media/image82.png)

We will now log in to the registry and push the images using the
following commands. Install Azure PowerShell modules using this
[link](https://docs.microsoft.com/en-us/powershell/azure/install-azurerm-ps?view=azurermps-6.6.0).

```Connect-AzureRMAccount```

![](/media/image83.png)

![](/media/image84.png)

Before pushing and pulling container images, you must log in to your
registry. Use the following command to first get the admin credentials
for the registry:
```
$registry = Get-AzureRMContainerRegistry -ResourceGroupName <RG_name<; -name <ContianerReg_name>;

$creds = Get-AzureRmContainerRegistryCredential -Registry $registry
```
![](/media/image85.png)

Now run the Docker login.
```
$creds.Password | docker login $registry.LoginServer -u $creds.Username --password-stdin
```
![](/media/image86.png)

Now that you've logged in to the registry, you can push container images
to it.
```
docker push <acrName>.azurecr.io/<image_name>
```
![](/media/image87.png)

You should now see **five image repositories** in the **Container
Registry**.

![](/media/image88.png)

### Configure and deploy container groups

With the images now in your registry, deploy a container group directly
to Azure Container Instances to see them running in Azure.

Open up VS Code and navigate to the deployments folder in the Pinball
repo at **C:\\&lt;install
dir&gt;\\gaming\\pinball-lizard\\deployments\\multi-container-group-template,**
and open the **parameters.json** file.
```
{
"\$schema":
"https://schema.management.azure.com/schemas/2015-01-01/deploymentParameters.json\#",
"contentVersion": "1.0.0.0",
"parameters": {
"groupSuffix": {
"value": "prod"
},
"commanderURI": {
"value": "set-in-parameter-file "
},
"commanderPort": {
"value": "9221"
},
"internalRelayURI": {
"value": "set-in-parameter-file "
},
"relayPort": {
"value": "9125"
},
"routerURI": {
"value": "set-in-parameter-file "
},
"routerWebsocketPort": {
"value": "8085"
},
"routerBackdoorPort": {
"value": "9010"
},
"mixerURI": {
"value": "set-in-parameter-file "
},
"mixerPort": {
"value": "9110"
},
"playfabURI": {
"value": "set-in-parameter-file "
},
"playfabPort": {
"value": "9111"
},
<span id="_Hlk520982550"
class="anchor"></span>"imageRegistryLoginServer": {
"value": "set-in-parameter-file "
},
"imageUsername": {
"value": "set-in-parameter-file "
},
"imagePassword": {
"value": "set-in-parameter-file "
},
"osType": {
"value": "Linux"
},
"numberCoresContainer": {
"value": "1"
},
"memoryContainer": {
"value": "2"
},
"numberCoresContainerLight": {
"value": ".5"
}
}
}
```
Leaving the port numbers at their default value, input the tagged
container images for the following values:

commanderURI

internalRelayURI

routerURI

mixerURI

playfabURI

![](/media/image89.png)

You will need the Container Registry **Login Server URI**, **Username**,
and **Password** for the following values:

![](/media/image90.png)

**\*\*\*Note:** You may have to regenerate a registry key/password until
it does not contain special characters such as ‘\#’ or ‘%’.

Once you have entered the required parameters, execute the
**deploy.ps1** PowerShell deployment script. You will be prompted for
your **subscription ID**, **resource group name**, and a **deployment
name**.

![](/media/image91.png)

![](/media/image92.png)

The process can take a few minutes. You can watch the progress in the
Azure portal under **&lt;container\_group&gt; -&gt; Containers**.

![](/media/image93.png) <span id="_Integrating_Playfab"
class="anchor"></span>

### <span id="_Run_Docker_Containers" class="anchor"><span id="_Integrating_Mixer" class="anchor"><span id="_Toc519166873" class="anchor"></span></span></span>Verify deployment 

**\*\*\*Note:** If you run into issues, make sure to copy values into
notepad before pasting them into the parameters.json file in order to
strip any encoding.

You will have a successful container group deployment once all
containers are in a running state.

![](/media/image94.png)

### <span id="_Record_the_Container" class="anchor"><span id="_Toc519166874" class="anchor"></span></span>Record the Container Group IP

Once the Container Group has been fully deployed, you need to record the
IP address at **&lt;Container\_Group&gt; -&gt; Overview -&gt; IP
address** and input it into the following **Azure Functions App**
setting as well as in the local.settings.json file located in your local
web-functions folder.

INTERNAL\_RELAY\_IP

App Gateway backend settings

SSL backend cert

We need to generate a .pfx bundle and a .cer certificate for backend
authentication on the Application Gateway. Open an elevated PowerShell
session and use the following commands to generate a .pfx bundle:
```
$cert = New-SelfSignedCertificate -Subject localhost -DnsName localhost -FriendlyName "Gateway Backend" -KeyUsage DigitalSignature  -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.1")

Export-PfxCertificate -Cert $cert -FilePath certificate.pfx  -Password (ConvertTo-SecureString -String <password> -Force  -AsPlainText)
```
> ![](/media/image95.png)

Run the following command in bash to extract the client certificate from
the pfx bundle using the password created in the previous step. While
still in Powershell, type bash and press enter to launch bash prompt.

```openssl pkcs12 -in input.pfx -out mycerts.crt -nokeys -clcerts```

![](/media/image96.png)

Run the following command to convert the client certificate from PEM
format to DER:

```openssl x509 -inform pem -in mycerts.crt -outform der -out mycerts.cer```

![](/media/image97.png)
HTTPS settings

We will be creating HTTPS settings for the web socket and command.
Navigate **to &lt;App\_Gateway&gt; -&gt; Settings -&gt; HTTP Settings**
and click **+ Add** to create the web socket settings. Choose port
**8085, HTTPS,** and select the **.cer** certificate we generated in the
previous step.

![](/media/image98.png)

Follow the same steps for command, but select port **9010** instead.

![](/media/image99.png)

Listeners

Next we will need to create two HTTPS listeners for ports 9010 and 443.
Navigate to **&lt;App\_Gateway&gt; -&gt; Settings -&gt; Listeners -&gt;+ Basic**. For the first listener (back door), select **9010** as the
port and upload the **pfx cert** created in previous steps.

![](/media/image100.png)

For the second listener (web socket), select **443** as the port and the
**pfx cert**.

![](/media/image101.png)

Rules

You will now create two rules to tie the settings together. First,
create a rule called rule1 and select the port 9010 listener created in
the previous step as well as the port 9010 HTTPS setting.

![](/media/image102.png)

Next, create a rule called rule2 and select the port 8085 listener
created in the previous step as well as the port 8085 HTTPS setting.

![](/media/image103.png)

Once you have created and applied the rules, you should now see the
associated rule listed under your **Listeners** pane.

![](/media/image104.png)

Backend pool

With the **HTTP Settings**, **Listeners**, and **Rules** in place, we
need to point the backend pool to a specific IP. Edit the **Backend
pool** and use the **INTERNAL\_RELAY\_IP** recorded in previous steps.

![](/media/image105.png)

Here is the screen shot after it is done.

![](/media/image106.png)

<br><br>
[PREV: Set up Azure Functions](/docs/02_Set_up_Azure_Functions.md)

[NEXT: Unity](/docs/04_Unity.md)