#!/bin/bash -e

REGISTRY_SERVER=${DOCKER_REPO%%/*}
echo "$DOCKER_REGISTRY_PASS" | docker login -u "$DOCKER_REGISTRY_USER" --password-stdin $REGISTRY_SERVER

docker build -t deploy-image -f docker/production/Dockerfile .

if [[ $TRAVIS_PULL_REQUEST = "false" ]]; then
    if [[ $TRAVIS_BRANCH != "master" ]]; then
        tag_base="$TRAVIS_BRANCH-"
    fi
else
    tag_base="$TRAVIS_PULL_REQUEST_BRANCH-"
fi

version=$( jq -r .version package.json )
hash=$( git rev-parse --short=6 $TRAVIS_COMMIT )

tags=(
    "${tag_base}latest"
    "$tag_base$version"
    "$tag_base$version-$hash"
)

for tag in "${tags[@]}"; do
    docker tag deploy-image $DOCKER_REPO:$tag
done

docker push $DOCKER_REPO

exit $?
