Appendix
========

Install Postman
---------------

Download and install Postman using this
[link](https://www.getpostman.com/apps).

<span id="_Install_Windows_Subsystem" class="anchor"><span id="_Toc519166887" class="anchor"></span></span>Install Windows Subsystem for Linux
----------------------------------------------------------------------------------------------------------------------------------------------

In this guide, we use the Windows Subsystem for Linux and Ubuntu. If you
do not already have WSL installed, follow [these
instructions](https://docs.microsoft.com/en-us/windows/wsl/install-win10)
for Windows 10.

Install Node.js on Ubuntu
-------------------------

Open PowerShell, type **bash** and press enter, and then run the
following commands to install Node.js on Ubuntu using WSL:
```
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash /
-sudo apt-get install -y nodejs
```
Verify installation was completed successfully by running the following
command:

```npm -v ```

Install Git and clone the Pinball Lizard repo on Ubuntu
-------------------------------------------------------

Open PowerShell, type **bash** and press enter, and then run the
following commands**:**
```
sudo apt-get install git
cd \~
git clone https://github.com/Azure/gaming.git
```
Install Windows SDK
-------------------

Download and install the Windows SDK
[here](https://developer.microsoft.com/en-US/windows/downloads/windows-10-sdk).

Develop functions using Azure Functions Runtime Beta 2.X
--------------------------------------------------------

1.  As of 2.0.1-beta.26, a worker runtime setting is required and can be
    set using the following command. Since we are developing JavaScript
    functions, you will be using the **node** runtime. This will modify
    the local.settings.json file of the current Azure Functions project.

    **func settings add FUNCTIONS\_WORKER\_RUNTIME node**

    ![](/media/image122.png)

2.  Auto cert generation is currently unavailable on the .NET core
    build, so you will need to run the following commands in PowerShell
    in order to generate the SSL certs you need:

    **\$cert = New-SelfSignedCertificate -Subject localhost -DnsName
    localhost -FriendlyName "Functions Development" -KeyUsage
    DigitalSignature
    -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.1")**

    **Export-PfxCertificate -Cert \$cert -FilePath certificate.pfx
    -Password (ConvertTo-SecureString -String &lt;password&gt;
    -Force -AsPlainText)**

![](/media/image123.png)

1.  Start the Azure Functions host with HTTPS over a custom port using
    the following command to verify configuration. Press **CTRL + C**
    to exit. :

``` 
    func host start --port 4034 --useHttps --cert <yourCertificate>.pfx --password <theCertificatePrivateKey>
```

<br><br>
[PREV: Unity](/docs/04_Unity.md)