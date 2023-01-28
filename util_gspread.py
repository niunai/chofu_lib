import os
from os.path import join, dirname
from dotenv import load_dotenv

import gspread
from google.oauth2.service_account import Credentials

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

GOOGLE_WORKBOOK_KEY = os.environ.get("GOOGLE_WORKBOOK_KEY")
GOOGLE_CREDENTIALS_JSON = os.environ.get("GOOGLE_CREDENTIALS_JSON")


def gspreadsheet_append(books):

    secret_credentials_json_oath = GOOGLE_CREDENTIALS_JSON

    scopes = [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
    ]

    credentials = Credentials.from_service_account_file(
        secret_credentials_json_oath,
        scopes=scopes
    )

    gc = gspread.authorize(credentials)
    workbook = gc.open_by_key(GOOGLE_WORKBOOK_KEY)
    worksheet = workbook.sheet1

    row = worksheet.row_count

    for book in books:
        book[0] = row
        del book[6]
        row += 1

    worksheet.append_rows(books)
