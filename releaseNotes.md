# Release Notes

## v 1.1.0 (Aug 2015)

### API

Some minor adjustments were made API-wise, mostly to accommodate the GUI revamp :

* Fixed tournamentControllerUtils.updateTournament method if no valid tournament is found (if tournament is not found, http return status is now 404 and not 200)

### App

Massive GUI revamp. This revamp is aimed at getting any tournament started faster :

* **Rebuilt** the UI so that you can get started in 2-3 clicks + a little typing
* **Kept** most fine tuning options. They have changed places but are still here.
* **Removed** the player "rearrange" feature in the list displayed as it was not very practical, bracket preconfiguration feature (or a correctly ordered import file) should do the trick most of the time
* **Removed** the lock/unlock tournament feature (not sur if it's of any use)
* **Changed** alerting (users should get less "useless" alerts like not very useful confirmations and such, error alerts are still there)
* **Fixed** SimpleGSLGroups now correctly display player factions even in the "group matches section"
* **Changed** Changed reporting / unreporting icons (SingleElim & SimpleGSLGroups engines)
