"""Regression tests for the public Arzan price-section parser."""
import unittest

from scripts.arzan_daily import parse_offers


class ParseOffersTests(unittest.TestCase):
    def wrap(self, section):
        return (
            '<html><body><h1>Вода минеральная Tassay газированная 1л</h1>'
            '<h2>Цены по магазинам</h2>'
            f'<div>{section}</div>'
            '<h2>Похожие товары</h2>'
            '<div>Arbuz 999 ₸</div>'
            '</body></html>'
        )

    def test_astana_tassay_all_three_shops_amid_other_retailers(self):
        # Public listing observed on the exact Astana TASSAY card on 2026-11-10.
        html = self.wrap(
            'Жанұя Оптомаркет 405 ₸ AyanMarket 439 ₸ '
            'Small (р-н Нура, ул. Ш. Айтматова, зд. 44) 465 ₸ '
            'METRO 499 ₸ Arbuz 555 ₸ Яндекс Лавка 572 ₸ '
            'Galmart 585 ₸ Choco Рядом 601 ₸ Загрузка'
        )
        title, offers = parse_offers(html, 'TASSAY')
        self.assertIn('газированная 1л', title)
        self.assertEqual(offers, {'SMALL': 465, 'Arbuz': 555, 'Galmart': 585})

    def test_unavailable_shop_does_not_take_next_shops_price(self):
        html = self.wrap(
            'Arbuz Нет в наличии Яндекс Лавка 572 ₸ '
            'Galmart 585 ₸ Choco Рядом 601 ₸'
        )
        _, offers = parse_offers(html, 'TASSAY')
        self.assertEqual(offers, {'Galmart': 585})

    def test_ambiguous_prices_of_one_shop_are_not_guessed(self):
        html = self.wrap(
            'Arbuz 555 ₸ 650 ₸ Яндекс Лавка 572 ₸ Small 465 ₸'
        )
        _, offers = parse_offers(html, 'TASSAY')
        self.assertEqual(offers, {'SMALL': 465})

    def test_turan_three_shops(self):
        html = self.wrap(
            'Arbuz 360 ₸ Small 465 ₸ Galmart 455 ₸'
        )
        _, offers = parse_offers(html, 'TURAN')
        self.assertEqual(offers, {'Arbuz': 360, 'SMALL': 465, 'Galmart': 455})


if __name__ == '__main__':
    unittest.main()
