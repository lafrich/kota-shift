"""Smoke test in an embedded Chromium page; browser policy blocks navigation, so inline app."""
from pathlib import Path
import base64,re,json,asyncio
from playwright.async_api import async_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
css=(root/'src/style.css').read_text()
js=(root/'src/game.js').read_text()
asset_data={str(p.relative_to(root/'assets')):'data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode() for p in (root/'assets').rglob('*.png')}
js=js.replace("im.src='./assets/'+imagePaths[k]", "im.src=window.DATAASSETS[imagePaths[k]]")
js=js.replace('`url(./assets/${imagePaths[state.skin]})`','`url(${window.DATAASSETS[imagePaths[state.skin]]})`')
js=js.replace('`<button class="avatar-option ${state.skin===k?', '`<button class="avatar-option ${state.skin===k?') # no-op
js=js.replace('src="./assets/${imagePaths[k]}"','src="${window.DATAASSETS[imagePaths[k]]}"')
html=html.replace('<link rel="stylesheet" href="./src/style.css">','<style>'+css+'</style>')
html=html.replace('<script src="./src/game.js" defer></script>','<script>window.DATAASSETS='+json.dumps(asset_data)+';</script><script>'+js+'</script>')
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=await browser.new_page(viewport={'width':1440,'height':850},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.set_content(html,wait_until='load')
  await page.wait_for_timeout(1500)
  print('loaded',await page.evaluate('Object.keys(DATAASSETS).length'))
  await page.screenshot(path=str(root.parent/'kota-shift-preview-welcome.png'))
  await page.click('button[data-act="close"]')
  await page.wait_for_timeout(700)
  await page.screenshot(path=str(root.parent/'kota-shift-preview.png'))
  await page.keyboard.down('d');await page.wait_for_timeout(500);await page.keyboard.up('d')
  print('move',await page.evaluate('KotaShiftTest.getState().c'))
  await page.evaluate('KotaShiftTest.teleport(4.6,5.6)')
  await page.keyboard.press('e')
  print('work',await page.evaluate('KotaShiftTest.getState().work'))
  await page.click('#btnBag');print('bag_panel',await page.locator('#panelTitle').inner_text())
  await page.click('#btnClose')
  print('errors',errors)
  # Mobile sanity, independent browser page (fresh state)
  mobile=await browser.new_page(viewport={'width':390,'height':820},device_scale_factor=1,has_touch=True,is_mobile=True)
  mobile.on('pageerror',lambda e:errors.append('mobile '+str(e)))
  await mobile.set_content(html,wait_until='load')
  await mobile.wait_for_timeout(1200)
  await mobile.click('button[data-act="close"]')
  await mobile.screenshot(path=str(root.parent/'kota-shift-preview-mobile.png'))
  print('mobile errors',errors)
  await browser.close()
if __name__=='__main__':asyncio.run(main())
