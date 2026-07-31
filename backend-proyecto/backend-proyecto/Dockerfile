FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

COPY backend-proyecto/backend-proyecto/backend-proyecto.csproj backend-proyecto/backend-proyecto/

RUN dotnet restore backend-proyecto/backend-proyecto/backend-proyecto.csproj

COPY backend-proyecto/ backend-proyecto/

WORKDIR /src/backend-proyecto/backend-proyecto

RUN dotnet publish \
    -c Release \
    -o /app/publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0

RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "backend-proyecto.dll"]