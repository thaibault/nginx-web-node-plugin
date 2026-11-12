<!-- !/usr/bin/env markdown
-*- coding: utf-8 -*-
region header
Copyright Torben Sickert (info["~at~"]tsickert.com) 16.12.2012

License
-------

This library written by Torben Sickert stands under a creative commons naming
3.0 unported license. See https://creativecommons.org/licenses/by/3.0/deed.de
endregion -->

<!--|deDE:Projektstatus-->
<!--|frFR:État du projet-->
Project status
--------------

[![npm](https://img.shields.io/npm/v/nginxwebnodeplugin?color=%23d55e5d&label=npm%20package%20version&logoColor=%23d55e5d&style=for-the-badge)](https://www.npmjs.com/package/nginx-web-node-plugin)
[![npm downloads](https://img.shields.io/npm/dy/nginxwebnodeplugin.svg?style=for-the-badge)](https://www.npmjs.com/package/nginx-web-node-plugin)

[![build](https://img.shields.io/github/actions/workflow/status/thaibault/nginx-web-node-plugin/build.yaml?style=for-the-badge)](https://github.com/thaibault/nginx-web-node-plugin/actions/workflows/build.yaml)
[![build push package](https://img.shields.io/github/actions/workflow/status/thaibault/nginx-web-node-plugin/build-package-and-push.yaml?label=build%20push%20package&style=for-the-badge)](https://github.com/thaibault/nginx-web-node-plugin/actions/workflows/build-package-and-push.yaml)

[![check types](https://img.shields.io/github/actions/workflow/status/thaibault/nginx-web-node-plugin/check-types.yaml?label=check%20types&style=for-the-badge)](https://github.com/thaibault/nginx-web-node-plugin/actions/workflows/check-types.yaml)
[![lint](https://img.shields.io/github/actions/workflow/status/thaibault/nginx-web-node-plugin/lint.yaml?label=lint&style=for-the-badge)](https://github.com/thaibault/nginx-web-node-plugin/actions/workflows/lint.yaml)
[![test](https://img.shields.io/github/actions/workflow/status/thaibault/nginx-web-node-plugin/test-coverage-report.yaml?label=test&style=for-the-badge)](https://github.com/thaibault/nginx-web-node-plugin/actions/workflows/test-coverage-report.yaml)

[![code coverage](https://img.shields.io/coverallsCoverage/github/thaibault/nginx-web-node-plugin?label=code%20coverage&style=for-the-badge)](https://coveralls.io/github/thaibault/nginx-web-node-plugin)

[![deploy web documentation](https://img.shields.io/github/actions/workflow/status/thaibault/nginx-web-node-plugin/deploy-web-documentation.yaml?label=deploy%20web%20documentation&style=for-the-badge)](https://github.com/thaibault/nginx-web-node-plugin/actions/workflows/deploy-web-documentation.yaml)
[![web documentation](https://img.shields.io/website-up-down-green-red/https/tsickert.com/nginx-web-node-plugin.svg?label=web-documentation&style=for-the-badge)](https://tsickert.com/nginx-web-node-plugin)

<!--|deDE:Einsatzmöglichkeiten-->
<!--|frFR:Cas d'utilisation-->
Use case
--------

This [web-node](https://tsickert.com/web-node) plugin starts an
[nginx](https://nginx.org) process as reverse proxy in front of your
application server and stops it again when the application exits. Your
application keeps a single entry point while nginx terminates TLS, serves
static files or balances load.
<!--deDE:
    Dieses [web-node](https://tsickert.com/web-node)-Plugin startet einen
    [nginx](https://nginx.org)-Prozess als Reverse-Proxy vor Ihrem
    Anwendungsserver und beendet ihn wieder, wenn die Anwendung beendet wird.
    Ihre Anwendung behält einen einzigen Einstiegspunkt, während nginx TLS
    terminiert, statische Dateien ausliefert oder Last verteilt.
-->
<!--frFR:
    Ce plugin [web-node](https://tsickert.com/web-node) démarre un processus
    [nginx](https://nginx.org) comme proxy inverse devant votre serveur
    d'application et l'arrête lorsque l'application se termine. Votre
    application conserve un point d'entrée unique tandis que nginx gère le
    TLS, sert les fichiers statiques ou répartit la charge.
-->

Features included:
<!--deDE:Enthaltene Funktionen:-->
<!--frFR:Fonctionnalités incluses:-->

- Starts and stops nginx together with your application.<!--deDE:Startet und stoppt nginx zusammen mit Ihrer Anwendung.--><!--frFR:Démarre et arrête nginx en même temps que votre application.-->
- Waits until the proxy URL is reachable before the application continues.<!--deDE:Wartet, bis die Proxy-URL erreichbar ist, bevor die Anwendung fortfährt.--><!--frFR:Attend que l'URL du proxy soit joignable avant que l'application continue.-->
- Optional mode: the application keeps running if nginx is not available.<!--deDE:Optionaler Modus: Die Anwendung läuft weiter, wenn nginx nicht verfügbar ist.--><!--frFR:Mode optionnel: l'application continue de fonctionner si nginx n'est pas disponible.-->
- Reload nginx at runtime, e.g. after its configuration changed.<!--deDE:nginx zur Laufzeit neu laden, z. B. nachdem sich seine Konfiguration geändert hat.--><!--frFR:Recharger nginx à l'exécution, par exemple après une modification de sa configuration.-->

<div class="wd-table-of-contents">
    <h2 id="content">Content<!--deDE:Inhalt--><!--frFR:Contenu--></h2>
    <!--wd-table-of-contents-->
</div>

Installation
------------

nginx has to be installed on the system and available as "nginx" in the
"PATH". Install the plugin next to web-node and the
[application server plugin](https://tsickert.com/application-server-web-node-plugin)
it depends on. web-node discovers every installed package whose name ends
with "-web-node-plugin" automatically:
<!--deDE:
    nginx muss auf dem System installiert und als "nginx" im "PATH" verfügbar
    sein. Installieren Sie das Plugin neben web-node und dem
    [Anwendungsserver-Plugin](https://tsickert.com/application-server-web-node-plugin),
    von dem es abhängt. web-node erkennt jedes installierte Paket, dessen Name
    auf "-web-node-plugin" endet, automatisch:
-->
<!--frFR:
    nginx doit être installé sur le système et disponible sous le nom "nginx"
    dans le "PATH". Installez le plugin à côté de web-node et du
    [plugin de serveur d'application](https://tsickert.com/application-server-web-node-plugin)
    dont il dépend. web-node détecte automatiquement chaque paquet installé
    dont le nom se termine par "-web-node-plugin":
-->

```bash
yarn add web-node application-server-web-node-plugin nginx-web-node-plugin
```

<!--|deDE:Konfiguration-->
<!--|frFR:Configuration-->
Configuration
-------------

The plugin starts nginx without arguments, so nginx reads its default
configuration file (usually "/etc/nginx/nginx.conf"). It has to contain
"daemon off;", otherwise nginx detaches and the plugin can not track or stop
it. The plugin settings live below "webNode.applicationServer.proxy" in your
application's "package.json":
<!--deDE:
    Das Plugin startet nginx ohne Argumente, sodass nginx seine
    Standard-Konfigurationsdatei liest (meist "/etc/nginx/nginx.conf"). Sie
    muss "daemon off;" enthalten, sonst löst sich nginx vom Prozess und das
    Plugin kann es weder überwachen noch beenden. Die Plugin-Einstellungen
    liegen unterhalb von "webNode.applicationServer.proxy" in der
    "package.json" Ihrer Anwendung:
-->
<!--frFR:
    Le plugin démarre nginx sans argument, nginx lit donc son fichier de
    configuration par défaut (généralement "/etc/nginx/nginx.conf"). Celui-ci
    doit contenir "daemon off;", sinon nginx se détache et le plugin ne peut
    ni le suivre ni l'arrêter. Les paramètres du plugin se trouvent sous
    "webNode.applicationServer.proxy" dans le "package.json" de votre
    application:
-->

```JSON
{
    "webNode": {
        "applicationServer": {
            "proxy": {
                "optional": false,
                "url": "https://127.0.0.1/"
            }
        }
    }
}
```

- "url": Address nginx answers on. It is polled for up to three seconds after
  start and must answer with a status code below 400. Defaults to
  "http://127.0.0.1/".<!--deDE:"url": Adresse, unter der nginx antwortet. Sie wird nach dem Start bis zu drei Sekunden lang abgefragt und muss mit einem Statuscode unter 400 antworten. Standardmäßig "http://127.0.0.1/".--><!--frFR:"url": Adresse à laquelle nginx répond. Elle est interrogée pendant trois secondes au maximum après le démarrage et doit répondre avec un code de statut inférieur à 400. Par défaut "http://127.0.0.1/".-->
- "optional": If "true" (default) a failing nginx only logs a warning,
  otherwise the application stops.<!--deDE:"optional": Bei "true" (Standard) erzeugt ein fehlschlagendes nginx nur eine Warnung, andernfalls wird die Anwendung beendet.--><!--frFR:"optional": Si "true" (par défaut), un échec de nginx ne produit qu'un avertissement, sinon l'application s'arrête.-->
- "logFilePath.access" and "logFilePath.error": Log destinations, defaulting
  to standard output and standard error. They are meant to be used in a
  generated nginx configuration, see below.<!--deDE:"logFilePath.access" und "logFilePath.error": Log-Ziele, standardmäßig Standardausgabe und Standardfehlerausgabe. Sie sind für die Verwendung in einer generierten nginx-Konfiguration gedacht, siehe unten.--><!--frFR:"logFilePath.access" et "logFilePath.error": Destinations des journaux, par défaut la sortie standard et la sortie d'erreur standard. Elles sont destinées à une configuration nginx générée, voir ci-dessous.-->

<!--|deDE:nginx-Konfiguration generieren-->
<!--|frFR:Générer la configuration nginx-->
### Generating the nginx configuration

Combined with the [EJS plugin](https://tsickert.com/ejs-web-node-plugin) you
can derive the nginx configuration from the same web-node configuration. A
template "nginx.conf.ejs" is rendered to "nginx.conf" before nginx starts.
Link it to the location nginx reads, e.g. "/etc/nginx/nginx.conf":
<!--deDE:
    In Kombination mit dem
    [EJS-Plugin](https://tsickert.com/ejs-web-node-plugin) können Sie die
    nginx-Konfiguration aus derselben web-node-Konfiguration ableiten. Eine
    Vorlage "nginx.conf.ejs" wird vor dem Start von nginx zu "nginx.conf"
    gerendert. Verlinken Sie sie an den Ort, den nginx liest, z. B.
    "/etc/nginx/nginx.conf":
-->
<!--frFR:
    Combiné au [plugin EJS](https://tsickert.com/ejs-web-node-plugin), vous
    pouvez dériver la configuration nginx de la même configuration web-node.
    Un modèle "nginx.conf.ejs" est transformé en "nginx.conf" avant le
    démarrage de nginx. Liez-le à l'emplacement lu par nginx, par exemple
    "/etc/nginx/nginx.conf":
-->

```EJS
<%_ const server = _.configuration.applicationServer _%>
daemon off;

events {}
http {
    access_log <%- server.proxy.logFilePath.access %>;
    error_log <%- server.proxy.logFilePath.error %>;

    server {
        listen 80;

        location / {
            proxy_pass http://<%- server.hostName %>:<%- server.port %>;
        }
    }
}
```

<!--|deDE:Dienste-->
<!--|frFR:Services-->
Services
--------

- "services.nginx": The running nginx child process or "null" if it is
  optional and could not be started.<!--deDE:"services.nginx": Der laufende nginx-Kindprozess oder "null", falls er optional ist und nicht gestartet werden konnte.--><!--frFR:"services.nginx": Le processus enfant nginx en cours d'exécution ou "null" s'il est optionnel et n'a pas pu être démarré.-->
- "services.nginx.reload()": Runs "nginx -s reload".<!--deDE:"services.nginx.reload()": Führt "nginx -s reload" aus.--><!--frFR:"services.nginx.reload()": Exécute "nginx -s reload".-->
- "checkReachability(configuration.applicationServer)": Waits until the proxy
  URL answers, exported for use in other plugins.<!--deDE:"checkReachability(configuration.applicationServer)": Wartet, bis die Proxy-URL antwortet; für andere Plugins exportiert.--><!--frFR:"checkReachability(configuration.applicationServer)": Attend que l'URL du proxy réponde, exporté pour d'autres plugins.-->

<!--|deDE:Entwicklung-->
<!--|frFR:Développement-->
Development
-----------

```bash
yarn install
yarn build
yarn test
```
