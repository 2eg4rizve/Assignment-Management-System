FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY Directory.Build.props AssignmentManagement.sln ./
COPY src/AssignmentManagement.Domain/AssignmentManagement.Domain.csproj src/AssignmentManagement.Domain/
COPY src/AssignmentManagement.Application/AssignmentManagement.Application.csproj src/AssignmentManagement.Application/
COPY src/AssignmentManagement.Infrastructure/AssignmentManagement.Infrastructure.csproj src/AssignmentManagement.Infrastructure/
COPY src/AssignmentManagement.Api/AssignmentManagement.Api.csproj src/AssignmentManagement.Api/
RUN dotnet restore src/AssignmentManagement.Api/AssignmentManagement.Api.csproj

COPY src/ src/
RUN dotnet publish src/AssignmentManagement.Api/AssignmentManagement.Api.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
RUN apt-get update \
    && apt-get install --no-install-recommends --yes curl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/publish .
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "AssignmentManagement.Api.dll"]
