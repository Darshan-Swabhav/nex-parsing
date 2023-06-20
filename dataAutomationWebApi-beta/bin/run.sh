# start container
#!/bin/bash
docker run --rm -d --name backend-api \
  -p 20100:20100 \
    gcr.io/${PROJECT_ID}/backend-api:latest