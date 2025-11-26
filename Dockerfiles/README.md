# Dockerfiles

Place your Dockerfiles for the microservices in this directory.

## Required Dockerfiles

1. **inventory-app/Dockerfile** - For the inventory application
2. **billing-app/Dockerfile** - For the billing application  
3. **api-gateway/Dockerfile** - For the API gateway application

## Example Structure

```
Dockerfiles/
├── inventory-app/
│   └── Dockerfile
├── billing-app/
│   └── Dockerfile
└── api-gateway/
    └── Dockerfile
```

## Building and Pushing Images

After creating your Dockerfiles, build and push to Docker Hub:

```bash
# Set your Docker Hub username
export DOCKERHUB_USERNAME=your-username

# Build and push inventory-app
docker build -t $DOCKERHUB_USERNAME/inventory-app:latest ./inventory-app
docker push $DOCKERHUB_USERNAME/inventory-app:latest

# Build and push billing-app
docker build -t $DOCKERHUB_USERNAME/billing-app:latest ./billing-app
docker push $DOCKERHUB_USERNAME/billing-app:latest

# Build and push api-gateway
docker build -t $DOCKERHUB_USERNAME/api-gateway:latest ./api-gateway
docker push $DOCKERHUB_USERNAME/api-gateway:latest
```

Remember to update the image references in the Kubernetes manifests after pushing!

