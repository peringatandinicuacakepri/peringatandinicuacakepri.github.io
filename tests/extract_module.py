"""Extract the app's inline scripts from index.html for testing.
Produces: app_module.mjs (type=module source) and nomodule.js (ES5 fallback)."""
import re, os
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, '..', 'index.html'), encoding='utf-8').read()
mod = re.findall(r'<script type="module">(.*?)</script>', src, re.S)[0]
open(os.path.join(here, 'app_module.mjs'), 'w', encoding='utf-8').write(mod)
nom = re.findall(r'<script nomodule>(.*?)</script>', src, re.S)[0]
open(os.path.join(here, 'nomodule.js'), 'w', encoding='utf-8').write(nom)
print('extracted app_module.mjs + nomodule.js')
