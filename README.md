# Descom Monitor

Kiosk electron app for displaying websites.

# Config

Fill a file named `config.json` with the following content:

```json
{
  "interval": 10000,
  "steps": [
    {
      "name": "TORTITAS",
      "interval": 10000,
      "url": "https://tortitas.eu"
    },
    {
      "name": "DESCOM",
      "interval": 2000,
      "url": "https://descom.es"
    }
  ]
}
```
