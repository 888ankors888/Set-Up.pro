#!/usr/bin/env bash
set -euo pipefail
pip install -r requirements.txt
curl --fail --location --proto '=https' --tlsv1.2 https://gu-st.ru/content/lending/russian_trusted_root_ca_pem.crt -o russian_trusted_root_ca_pem.crt
python -c "import ssl; ssl.create_default_context(cafile='russian_trusted_root_ca_pem.crt')"
