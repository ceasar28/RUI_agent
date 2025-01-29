import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class GoogleSheetService {
  private readonly auth: any;

  constructor() {
    // Initializes the Google APIs client library and sets up the authentication using service account credentials.
    this.auth = new google.auth.GoogleAuth({
      keyFilename: 'src/google-sheet/google.json', // Path to your service account key file.
      scopes: ['https://www.googleapis.com/auth/spreadsheets'], // Scope for Google Sheets API.
    });
  }

  //   GaxiosPromise<sheets_v4.Schema$AppendValuesResponse>
  async writeToSheet(data: any): Promise<any> {
    const authClient = await this.auth.getClient();
    const sheets = await google.sheets({ version: 'v4', auth: authClient });
    const spreadsheetId = `1qoaaHduxN3kmTY31OH5-2ORUQRU7Z9H_uVqRgHtKvOM`;

    // '1za-OX-kX0fIH347eB-OWHZAP--4_ictam5bsrklQptc';
    const range = 'Sheet1!A1';
    const valueInputOption = 'USER_ENTERED';

    const requestBody = {
      values: [data],
    };

    try {
      const res = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption,
        insertDataOption: `INSERT_ROWS`,
        requestBody,
      });
      return res; // Returns the response from the Sheets API.
    } catch (error) {
      console.log(error);
    }
  }
}
