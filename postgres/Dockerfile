FROM postgres:10.3

# Add locally created files/dir to docker
ADD /tables/ /docker-entrypoint-initdb.d/tables
ADD /seed/ /docker-entrypoint-initdb.d/seed
ADD deploy_schemas.sql /docker-entrypoint-initdb.d/