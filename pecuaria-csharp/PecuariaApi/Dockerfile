# Imagem usada pelo Render para rodar a API.
# Build: dotnet publish em uma imagem com o SDK; execução: só o runtime do ASP.NET.

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY PecuariaApi.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
# O Render informa a porta pela variável PORT (o Program.cs lê essa variável)
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "PecuariaApi.dll"]
