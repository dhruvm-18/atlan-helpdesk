# Atlan Connectors Guide

## Snowflake Connector

To connect Snowflake to Atlan, you need the following permissions:

### Required Permissions
- USAGE on the warehouse
- USAGE on the database
- USAGE on the schema
- SELECT on all tables and views
- SHOW on the account (for metadata discovery)

### Setup Steps
1. Create a dedicated service account in Snowflake
2. Grant the required permissions
3. Configure the connector in Atlan with the credentials
4. Test the connection and run initial crawl

For detailed setup instructions, visit: https://docs.atlan.com/connectors/snowflake

## Tableau Connector

The Tableau connector automatically captures lineage from:
- Workbooks to data sources
- Dashboards to underlying datasets
- Calculated fields and their dependencies

### Lineage Support
- ✅ Direct table connections
- ✅ Custom SQL queries
- ✅ Published data sources
- ⚠️ Live connections (limited metadata)

More info: https://docs.atlan.com/connectors/tableau