# Build phase
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["EchoApi.csproj", "./"]
RUN dotnet restore "EchoApi.csproj"
COPY . .
RUN dotnet publish "EchoApi.csproj" -c Release -o /app/publish

# Run phase
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

COPY --from=build /app/publish .

# Important for Render/Railway SQLite persistent storage to function properly
RUN mkdir -p /data
ENV DatabaseConnection="Data Source=/data/echo.db"

ENTRYPOINT ["dotnet", "EchoApi.dll"]
