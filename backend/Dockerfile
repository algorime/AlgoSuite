# Use the official Python image as a parent image
FROM python:3.11-slim

# Install dependencies
RUN apt-get update && apt-get install -y curl unzip

# Set the working directory in the container
WORKDIR /app

# Download and install Nuclei
RUN NUCLEI_VERSION=$(curl -s "https://api.github.com/repos/projectdiscovery/nuclei/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' | cut -c 2-) && \
    curl -L "https://github.com/projectdiscovery/nuclei/releases/download/v${NUCLEI_VERSION}/nuclei_${NUCLEI_VERSION}_linux_amd64.zip" -o nuclei.zip && \
    unzip nuclei.zip && \
    mv nuclei /usr/local/bin/nuclei && \
    rm nuclei.zip

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application's code into the container at /app
COPY . .

# Make port 8001 available to the world outside this container
EXPOSE 8001

# The command is specified in the docker-compose.yml file