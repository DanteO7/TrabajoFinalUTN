# ==========================
# Etapa 1 - Build
# ==========================

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# Copiamos primero los archivos que cambian poco
COPY backend-proyecto/backend-proyecto.sln .
COPY backend-proyecto/backend-proyecto/backend-proyecto.csproj backend-proyecto/

# Restauramos las dependencias
RUN dotnet restore backend-proyecto/backend-proyecto.csproj

# Ahora copiamos todo el código
COPY backend-proyecto/. .

# Publicamos la aplicación
WORKDIR /src/backend-proyecto

RUN dotnet publish \
    -c Release \
    -o /app/publish \
    --no-restore

# ==========================
# Etapa 2 - Runtime
# ==========================

FROM mcr.microsoft.com/dotnet/aspnet:8.0

RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "backend-proyecto.dll"]
