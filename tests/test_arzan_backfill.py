"""Conservative regression checks for reconstruction from public Arzan history."""
import unittest
from scripts.backfill_arzan_history import as_of, backfill, chart_visible_shops

class HistoricalPriceTests(unittest.TestCase):
    def test_asof_uses_last_actual_event_not_future_price(self):
        events=[
            {"date":"2026-11-02","datetime":"2026-11-02T05:00:00Z","price":555,"in_stock":True},
            {"date":"2026-11-08","datetime":"2026-11-08T06:00:00Z","price":595,"in_stock":True}]
        self.assertEqual(as_of(events,"2026-11-03")[0],555)
        self.assertEqual(as_of(events,"2026-11-09")[0],595)
        self.assertIsNone(as_of(events,"2026-11-01"))

    def test_out_of_stock_is_not_misreported_as_a_quote(self):
        events=[{"date":"2026-11-04","price":555,"in_stock":False}]
        self.assertIsNone(as_of(events,"2026-11-05"))

    def test_recover_only_missing_chart_visible_shop(self):
        probe={"data":[{"brand":"TASSAY","history_hover":[
             {"text":"4 нояб.\n\nArbuz\n555 ₸\nSmall\n465 ₸"}],
             "history_api":{"stores":[
              {"chain_name":"Arbuz","prices":[{"date":"2026-11-02","price":555,"in_stock":True}]},
              {"chain_name":"Galmart","prices":[{"date":"2026-10-29","price":585,"in_stock":True}]}
             ]}}]}
        archive={"observations":[{"day":"2026-11-03","brand":"TASSAY","shop":"SMALL","city":"Астана","price":519}]}
        added=backfill(probe,archive)
        self.assertEqual(len(added),7)
        self.assertTrue(all(x["shop"]=="Arbuz" for x in added))
        self.assertEqual(len(archive["observations"]),8)
        self.assertEqual([x for x in archive["observations"] if x["shop"]=="SMALL"][0]["price"],519)

    def test_chart_visible_shop_names(self):
        sample={"history_hover":[{"text":"4 нояб.\n\nArbuz\n555 ₸\nSmall\n465 ₸"}]}
        self.assertEqual(chart_visible_shops(sample),{"Arbuz","SMALL"})

if __name__=="__main__":
    unittest.main()
