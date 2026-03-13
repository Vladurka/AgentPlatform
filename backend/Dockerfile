FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY src/ ./
RUN dotnet restore AgentPlatform.API/AgentPlatform.API.csproj
RUN dotnet publish AgentPlatform.API/AgentPlatform.API.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "AgentPlatform.API.dll"]
