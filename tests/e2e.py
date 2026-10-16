"""Headless browser test + screenshots. BASE defaults to local server (python3 -m http.server 8767)."""
import os, sys, urllib.parse
from playwright.sync_api import sync_playwright
BASE = os.environ.get('BASE', 'http://127.0.0.1:8767/')
OUT = os.environ.get('OUT', os.path.join(os.path.dirname(__file__), '..', 'screenshots'))
PFX = os.environ.get('PFX', '')
errors = []
def top(pg, sel): pg.evaluate(f"window.scrollTo(0, document.querySelector('{sel}').getBoundingClientRect().top + scrollY - 70)"); pg.wait_for_timeout(250)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('CHROME', '/usr/bin/google-chrome'), args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': 1366, 'height': 900})
    pg.on('pageerror', lambda e: errors.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errors.append(m.text))
    pg.goto(BASE); pg.evaluate('localStorage.clear()'); pg.reload(); pg.wait_for_timeout(400); pg.add_style_tag(content='html{scroll-behavior:auto!important}')
    assert 'Beta' in pg.text_content('.beta-bar')
    pg.screenshot(path=f'{OUT}/{PFX}01-landing.png')
    assert pg.locator('#models .model').count() == 6
    assert 'Estimate' in pg.text_content('#m-MCX7000') and 'Estimate' in pg.text_content('#m-MDM6100')
    assert 'priced listing' in pg.text_content('#m-M6100')
    rows = pg.locator('#lst tbody tr').count(); assert rows >= 20, rows
    assert pg.locator('#lst a[href^="https://"]').count() == rows
    top(pg, '#prices'); pg.screenshot(path=f'{OUT}/{PFX}02-price-guide.png')
    pg.click('#curSeg [data-c=USD]'); pg.wait_for_timeout(100); assert '$' in pg.text_content('#m-M6100 .range'); pg.click('#curSeg [data-c=EUR]')
    pg.click('[data-show=MCD6000]'); pg.wait_for_timeout(100); assert all('MCD6000' in t for t in pg.locator('#lst tbody tr td:first-child').all_text_contents())
    # checklist: IP receive 3 demods
    pg.select_option('[name=demods]', '3'); pg.wait_for_timeout(100)
    codes = pg.locator('#codeRows td.code').all_text_contents(); print('codes', codes)
    for k in ['VI-01', 'VP-02', 'DL-03', 'DR-02', 'HS-07']: assert k in codes, k
    pg.select_option('[name=input]', 'both'); pg.wait_for_timeout(100)
    assert 'Slot 3' in pg.text_content('#conflicts')
    pg.select_option('[name=input]', 'ip'); pg.check('[name=tx]'); pg.select_option('[name=demods]', '2'); pg.check('[name=equalink]'); pg.wait_for_timeout(100)
    codes = pg.locator('#codeRows td.code').all_text_contents(); assert 'VP-01' in codes and 'ML-01' in codes and 'AE-01' in codes and 'SR-06' in codes, codes
    top(pg, '#licences'); pg.screenshot(path=f'{OUT}/{PFX}03-licence-checklist.png')
    # use in quote
    pg.click('#useInQuote'); pg.wait_for_timeout(200)
    body = pg.input_value('#rqBody'); assert 'MCX7000' in body and 'VI-01' in body, body
    href = pg.get_attribute('#rqMail', 'href'); assert href.startswith('mailto:?subject='), href
    assert 'No contact address' in pg.text_content('#contactState')
    pg.fill('[name=name]', 'Test Buyer'); pg.wait_for_timeout(100); assert 'Test Buyer' in urllib.parse.unquote(pg.get_attribute('#rqMail', 'href'))
    top(pg, '#contact'); pg.screenshot(path=f'{OUT}/{PFX}04-quote-request.png')
    pg.reload(); pg.wait_for_timeout(300); assert pg.input_value('[name=name]') == 'Test Buyer'; print('persistence ok')
    m = b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, device_scale_factor=2)
    m.on('pageerror', lambda e: errors.append(str(e)))
    m.goto(BASE); m.wait_for_timeout(400); m.add_style_tag(content='html{scroll-behavior:auto!important}')
    m.screenshot(path=f'{OUT}/{PFX}05-mobile-landing.png')
    sw = m.evaluate('document.documentElement.scrollWidth'); print('mobile scrollWidth', sw); assert sw <= 392, sw
    top(m, '#m-MCX7000'); m.screenshot(path=f'{OUT}/{PFX}06-mobile-prices.png')
    top(m, '#chkOut'); m.screenshot(path=f'{OUT}/{PFX}07-mobile-checklist.png')
    b.close()
print('JS errors:', errors or 'none')
sys.exit(1 if errors else 0)
