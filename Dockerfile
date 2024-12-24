# Project: v3-subgraph
# Description: -

FROM node:lts AS subgraph

######################################################################
# LABELS
######################################################################
ARG COMMIT_ID
ARG COMMIT_TIMESTAMP
ARG COMMIT_AUTHOR
ARG BUILD_APPLICATION
ARG BUILD_DATE

LABEL org.vcs.CommitId=${COMMIT_ID}
LABEL org.vcs.CommitTimestamp=${COMMIT_TIMESTAMP}
LABEL org.vcs.CommitAuthor=${COMMIT_AUTHOR}
LABEL org.build.Application=${BUILD_APPLICATION}
LABEL org.build.Date=${BUILD_DATE}

######################################################################
# BUILD STAGE
######################################################################
RUN npm install -g @graphprotocol/graph-cli@0.69.2

RUN mkdir /subgraph
COPY package.json /subgraph
WORKDIR /subgraph
RUN npm i
RUN python3 -m pip install yaml --no-chache --default-timeout=60
COPY . /subgraph
