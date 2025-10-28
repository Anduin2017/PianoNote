# Piano note calculator

[![ManHours](https://manhours.aiursoft.com/r/gitlab.aiursoft.com/anduin/pianonote.svg)](https://gitlab.aiursoft.com/anduin/pianonote/-/commits/master?ref_type=heads)

![screenshot](./screenshot.png)

## Run in Docker

First, install Docker [here](https://docs.docker.com/get-docker/).

Then run the following commands in a Linux shell:

```bash
image=hub.aiursoft.com/anduin/pianonote
appName=pianonote
sudo docker pull $image
sudo docker run -d --name $appName --restart unless-stopped -p 5000:5000 $image
```

That will start a web server at `http://localhost:5000` and you can test the app.

The docker image has the following context:

| Properties  | Value                                  |
|-------------|----------------------------------------|
| Image       | hub.aiursoft.com/anduin/pianonote       |
| Ports       | 5000                                   |
| Binary path | /app                                   |
| Data path   | /data                                  |
