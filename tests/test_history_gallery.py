"""BSH history screenshot manifest checks without relying on live GitHub."""
import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from history_gallery import _remote_images, _local_images, safe_image, STAGES, LEGACY_FILES

class HistoryGalleryTests(unittest.TestCase):
    def test_rejects_traversal_and_non_image_files(self):
        for name in ("../secret.png","..\\secret.png","file.txt",".hidden.jpg","folder/pic.png"):
            self.assertFalse(safe_image("BSH1",name))
        self.assertFalse(safe_image("EXTRA","screen.png"))
        self.assertTrue(safe_image("BSH2","сравнение цен.png"))

    def test_only_explicit_stage_image_paths_are_exposed(self):
        tree={"truncated":False,"tree":[
           {"type":"blob","path":"history-screenshots/BSH1/начало.png"},
           {"type":"blob","path":"history-screenshots/BSH2/second.jpg"},
           {"type":"blob","path":"history-screenshots/BSH3/README.md"},
           {"type":"blob","path":"data/secret.png"},
           {"type":"tree","path":"history-screenshots/BSH4"},
           {"type":"blob","path":"history-screenshots/BSH4/../../secret.jpg"}
        ]}
        result=_remote_images(tree)
        self.assertEqual(len(result["BSH1"]),1)
        self.assertEqual(len(result["BSH2"]),1)
        self.assertEqual(len(result["BSH3"]),0)
        self.assertEqual(len(result["BSH4"]),0)
        self.assertIn("%D0",result["BSH1"][0]["url"])
        self.assertTrue(result["BSH2"][0]["url"].startswith("https://raw.githubusercontent.com/"))
        self.assertEqual(set(result),set(STAGES))

    def test_original_variant_screenshots_assigned_to_correct_stages(self):
        tree={"truncated":False,"tree":[
            {"type":"blob","path":"первый вариант.png"},
            {"type":"blob","path":"второй вариант.png"},
            {"type":"blob","path":"третий вариант.png"},
            {"type":"blob","path":"посторонний документ.png"},
        ]}
        out=_remote_images(tree)
        for stage,name in LEGACY_FILES.items():
            self.assertEqual(len(out[stage]),1)
            self.assertEqual(out[stage][0]["name"],name)
            self.assertEqual(out[stage][0]["url"],f"/history-legacy-image/{stage}")
        self.assertEqual(out["BSH4"],[])

    def test_missing_stage_images_have_empty_placeholder_sets(self):
        result=_local_images()
        self.assertEqual(set(result),set(STAGES))
        self.assertTrue(all(isinstance(items,list) for items in result.values()))

if __name__=="__main__":
    unittest.main()
