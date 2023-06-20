const csv = require('csv-parser');
const fs = require('fs');
const request = require('request');

const filePath = 'AL_1K_patterns.csv';
let emailPatterns = [];
let totalEmailPatterns = 0;

async function dataStoreToDB(_emailPatterns) {
  return new Promise((resolve, reject) => {
    request(
      {
        url: 'http://127.0.0.1:20100/api/v1/emailPattern',
        method: 'POST',
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlJEWXlNRVZHTTBKQ1FrRXdNakUxTWtZMlJUWTFPREZCT0ROR09VVXlPRVZHUkRBMFJqUXdRUSJ9.eyJlbWFpbCI6ImFnZW50NEBuZXhzYWxlcy5jb20iLCJuYW1lIjoiYWdlbnQ0QG5leHNhbGVzLmNvbSIsIm5pY2tuYW1lIjoiYWdlbnQ0IiwicGljdHVyZSI6Imh0dHBzOi8vcy5ncmF2YXRhci5jb20vYXZhdGFyLzY3YmFjOTU5ZjcyNDZlMjBhODVhYzJlYTg5YWQ2MmM0P3M9NDgwJnI9cGcmZD1odHRwcyUzQSUyRiUyRmNkbi5hdXRoMC5jb20lMkZhdmF0YXJzJTJGYWcucG5nIiwidXNlcl9tZXRhZGF0YSI6eyJpc0VVTEFBY2NlcHRlZCI6dHJ1ZX0sImFwcF9tZXRhZGF0YSI6eyJhY3RpdmF0aW9uRW1haWxTZW50Ijp0cnVlLCJhY3RpdmF0aW9uVXJsIjoiaHR0cHM6Ly9pbm5vdmF0aW9uLmF1dGgwLmNvbS9sby9yZXNldD9pc2FjdGl2YXRlZmxvdz10cnVlJnRpY2tldD1JTkZpd2h3MGNObVNXRVpQNWYyWGg4ck5kbGppenhsRCMiLCJhdXRob3JpemF0aW9uIjp7InJvbGVzIjpbIkFjY291bnQgTWFuYWdlciJdLCJwZXJtaXNzaW9ucyI6WyJyZWFkOmNiciIsIndyaXRlOmNiciJdfSwiY2xpZW50TmFtZSI6IklubnZvdmF0aW9uIiwiY2xpZW50X2lkIjpbImNsaS1jZmI4NzdmNy1mYzJjLTQ0ODEtODhhMi1mNzc4NzEwZGNiOTciXX0sImFjdGl2YXRpb25FbWFpbFNlbnQiOnRydWUsImFjdGl2YXRpb25VcmwiOiJodHRwczovL2lubm92YXRpb24uYXV0aDAuY29tL2xvL3Jlc2V0P2lzYWN0aXZhdGVmbG93PXRydWUmdGlja2V0PUlORml3aHcwY05tU1dFWlA1ZjJYaDhyTmRsaml6eGxEIyIsImF1dGhvcml6YXRpb24iOnsicm9sZXMiOlsiQWNjb3VudCBNYW5hZ2VyIl0sInBlcm1pc3Npb25zIjpbInJlYWQ6Y2JyIiwid3JpdGU6Y2JyIl19LCJjbGllbnROYW1lIjoiSW5udm92YXRpb24iLCJncm91cHMiOlsiQWdlbnRzKGRldikiXSwicm9sZXMiOlsiYWdlbnQiXSwicGVybWlzc2lvbnMiOltdLCJjbGllbnRJRCI6IjZpanpvcTZXM05USWVYUGhvRnV0VXBjQlhpbjR3eE5EIiwiY3JlYXRlZF9hdCI6IjIwMjEtMDgtMDlUMTA6NDU6NTIuMzE2WiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpZGVudGl0aWVzIjpbeyJ1c2VyX2lkIjoiNjExMTA3NjA3ZDM5OTUwMDZhMTQxYTQ5IiwicHJvdmlkZXIiOiJhdXRoMCIsImNvbm5lY3Rpb24iOiJVc2VybmFtZS1QYXNzd29yZC1BdXRoZW50aWNhdGlvbiIsImlzU29jaWFsIjpmYWxzZX1dLCJ1cGRhdGVkX2F0IjoiMjAyMS0wOS0xNFQwNjo0NzoxNy41MDFaIiwidXNlcl9pZCI6ImF1dGgwfDYxMTEwNzYwN2QzOTk1MDA2YTE0MWE0OSIsImNsaWVudF9pZCI6WyJjbGktY2ZiODc3ZjctZmMyYy00NDgxLTg4YTItZjc3ODcxMGRjYjk3Il0sImlzcyI6Imh0dHBzOi8vaW5ub3ZhdGlvbi5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NjExMTA3NjA3ZDM5OTUwMDZhMTQxYTQ5IiwiYXVkIjoiNmlqem9xNlczTlRJZVhQaG9GdXRVcGNCWGluNHd4TkQiLCJpYXQiOjE2MzE2MDIwNDAsImV4cCI6MTYzMTYzODA0MH0.eSkIsjODuxCIxFO9ZZ57Xp4ZFbUiVc5JkpUMufI8u71yFcbCmwtthVQSN9mJfSDWDvYUJUh_F3Bt36lSKVdUsy12o0IQGoilAyuq0HBtRFFsb3Cbo3KngQYPqVY6D00se9rl2gb5Q18VaDvMrAhlnix2t6YshEBGVTrdkpqANt8YUrN4VPv1DB6UuS0w1MFyQEGYhd4ZjyhGWVfAXWi3m_mqH-v0R5Vi4yKRyNdpAtEzuB1iSqo-wamLpsqPP9n8sO6zhmfyAl74zwx-8PRXUgsJewzEPch7ROzhCSUcmZIL-_3_h3v4wKtLuhtM9h92eP9Ks7ybO5oF49ztbTbTgA',
        },
        form: {
          emailPatterns: _emailPatterns,
        },
      },
      (err, httpResponse, body) => {
        if (err) {
          console.log(` Error:  ${err}`);
          console.log(` Body : ${body}`);
          return reject(err);
        }
        if (httpResponse.statusCode === 200) {
          return resolve(httpResponse);
        }
        return reject(httpResponse);
      },
    );
  });
}

async function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const urlReaderStream = fs.createReadStream(filePath);

async function handleData(_row) {
  const emailPattern = {};
  const row = _row;
  row.patterns = JSON.parse(row.patterns);
  emailPattern.domain = row.Domain;
  emailPattern.patterns = row.patterns;
  emailPatterns.push(emailPattern);

  if (emailPatterns.length >= 50) {
    urlReaderStream.pause();
    // console.log("totalEmailPatterns :", totalEmailPatterns);
    // try {
    //   await dataStoreToDB(emailPatterns);
    //   console.log('SUCCESS: data push');
    //   console.log(emailPatterns);
    // } catch (error) {
    //   console.log('ERROR: data not push');
    //   console.log(emailPatterns);
    // }
    totalEmailPatterns += 1;
    console.log('START: data :', totalEmailPatterns * 50);
    if (totalEmailPatterns % 10 === 0) {
      await wait(2000);
    }
    if (totalEmailPatterns % 200 === 0) {
      await wait(10000);
    }

    dataStoreToDB(emailPatterns)
      .then(() => {
        console.log('SUCCESS: data push');
        emailPatterns = [];
        urlReaderStream.resume();
      })
      .catch(() => {
        console.log('ERROR: data not push');
        console.log(emailPatterns);
        emailPatterns = [];
        urlReaderStream.resume();
      });
  }
}
function handleError(error) {
  console.log('Error While Reading URLs');
  console.log(error);
}
async function handleEnd() {
  dataStoreToDB(emailPatterns)
    .then(() => {
      console.log('SUCCESS: data push');
      emailPatterns = [];
      console.log('URL Reading Complete');
    })
    .catch(() => {
      console.log('ERROR: data not push');
      console.log(emailPatterns);
      emailPatterns = [];
      console.log('URL Reading Complete');
    });
}

urlReaderStream
  .pipe(csv())
  .on('data', handleData)
  .on('error', handleError)
  .on('end', handleEnd);

urlReaderStream.on('pause', () => {
  console.log('pause');
});

urlReaderStream.on('resume', () => {
  console.log('resume');
});

// request({
//   url: 'http://127.0.0.1:20100/api/v1/emailPattern',
//   method: 'GET',
//   headers: {
//      'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlJEWXlNRVZHTTBKQ1FrRXdNakUxTWtZMlJUWTFPREZCT0ROR09VVXlPRVZHUkRBMFJqUXdRUSJ9.eyJlbWFpbCI6InZpdmVrLmppdmFuaUBuZXhzYWxlcy5jb20iLCJuYW1lIjoidml2ZWsuaml2YW5pQG5leHNhbGVzLmNvbSIsIm5pY2tuYW1lIjoidml2ZWsuaml2YW5pIiwicGljdHVyZSI6Imh0dHBzOi8vcy5ncmF2YXRhci5jb20vYXZhdGFyL2VmM2M5NTVmYTY4OTZjNzIyNDlkYWM5N2U0YTM1YWFlP3M9NDgwJnI9cGcmZD1odHRwcyUzQSUyRiUyRmNkbi5hdXRoMC5jb20lMkZhdmF0YXJzJTJGdmkucG5nIiwidXNlcl9tZXRhZGF0YSI6eyJpc0VVTEFBY2NlcHRlZCI6dHJ1ZX0sImxhc3RfcGFzc3dvcmRfcmVzZXQiOiIyMDIxLTA2LTIyVDE1OjM2OjAzLjIyMFoiLCJhcHBfbWV0YWRhdGEiOnsiYWN0aXZhdGlvbkVtYWlsU2VudCI6dHJ1ZSwiYWN0aXZhdGlvblVybCI6Imh0dHBzOi8vaW5ub3ZhdGlvbi5hdXRoMC5jb20vbG8vcmVzZXQ_aXNhY3RpdmF0ZWZsb3c9dHJ1ZSZ0aWNrZXQ9b3pxVXFoVDcweHVZVFJualZjQmJKSGY2aXNaRXBweEEjIiwiYXV0aG9yaXphdGlvbiI6eyJyb2xlcyI6WyJSaWdodGxlYWRzRW5kVXNlciJdLCJwZXJtaXNzaW9ucyI6WyJyZWFkOmxpc3RzIiwicmVhZDpjb250YWN0cyIsIndyaXRlOndpemFyZCIsInJlYWQ6Y3JlZGl0cyIsImFkdmFuY2U6Y29udGFjdHMiXX0sImNsaWVudE5hbWUiOiJJbm5vdmF0aW9uIFRlYW0gVGVzdCIsImNsaWVudF9pZCI6WyJjbGktMzcwOGI0ODQtNzYwNS00MzQ0LTg0MDEtMzU5MzI5ZDRhNGRkIl19LCJhY3RpdmF0aW9uRW1haWxTZW50Ijp0cnVlLCJhY3RpdmF0aW9uVXJsIjoiaHR0cHM6Ly9pbm5vdmF0aW9uLmF1dGgwLmNvbS9sby9yZXNldD9pc2FjdGl2YXRlZmxvdz10cnVlJnRpY2tldD1venFVcWhUNzB4dVlUUm5qVmNCYkpIZjZpc1pFcHB4QSMiLCJhdXRob3JpemF0aW9uIjp7InJvbGVzIjpbIlJpZ2h0bGVhZHNFbmRVc2VyIl0sInBlcm1pc3Npb25zIjpbInJlYWQ6bGlzdHMiLCJyZWFkOmNvbnRhY3RzIiwid3JpdGU6d2l6YXJkIiwicmVhZDpjcmVkaXRzIiwiYWR2YW5jZTpjb250YWN0cyJdfSwiY2xpZW50TmFtZSI6Iklubm92YXRpb24gVGVhbSBUZXN0IiwiZ3JvdXBzIjpbIiBNYW5hZ2VyIEdyb3VwIChkZXYpIl0sInJvbGVzIjpbIm1hbmFnZXIiXSwicGVybWlzc2lvbnMiOlsicmVhZDpjYnIiLCJ3cml0ZTpjYnIiXSwiY2xpZW50SUQiOiI2aWp6b3E2VzNOVEllWFBob0Z1dFVwY0JYaW40d3hORCIsImNyZWF0ZWRfYXQiOiIyMDIxLTAyLTEwVDExOjI2OjMyLjM3NVoiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaWRlbnRpdGllcyI6W3sidXNlcl9pZCI6IjYwMjNjMmU4YmNiNDc0MDA3MTk2YzZhNSIsInByb3ZpZGVyIjoiYXV0aDAiLCJjb25uZWN0aW9uIjoiVXNlcm5hbWUtUGFzc3dvcmQtQXV0aGVudGljYXRpb24iLCJpc1NvY2lhbCI6ZmFsc2V9XSwidXBkYXRlZF9hdCI6IjIwMjEtMDktMTNUMDQ6Mzc6NTMuOTEyWiIsInVzZXJfaWQiOiJhdXRoMHw2MDIzYzJlOGJjYjQ3NDAwNzE5NmM2YTUiLCJjbGllbnRfaWQiOlsiY2xpLTM3MDhiNDg0LTc2MDUtNDM0NC04NDAxLTM1OTMyOWQ0YTRkZCJdLCJpc3MiOiJodHRwczovL2lubm92YXRpb24uYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDYwMjNjMmU4YmNiNDc0MDA3MTk2YzZhNSIsImF1ZCI6IjZpanpvcTZXM05USWVYUGhvRnV0VXBjQlhpbjR3eE5EIiwiaWF0IjoxNjMxNTA3ODc2LCJleHAiOjE2MzE1NDM4NzZ9.WqPL2ht4Ga7sRrziYA6h-EfUhI28JqyZjqan_yl71uf8J_6MhLFKFaceJ6wht6incP0S12aAvJZOPHXObLzkKUUCDr5Fh8W8h5bomchTieE-gnDSjj3yHS56X1mWUJDcTRU960cU_rGyybBIFcRuMmGvVjnJH5MA9pMSQPiUmKfz1jL6kWj-wMuImSiPqUH2aOvauxdx7iEAUeGaPk1dWuLr2iJsn5opqqs0iNrLPXN7pUko-3B-6wIrgfM7YUVzYvD2fi07CZUPlMJ8yjuIQDPC2rtmAHm74FC1Wmbmg6YSwgjq3rV7fNCVJ3rxIbrvnbDdyBISl3cAGuiklJCuCw'
//   },
//   rejectUnauthorized: false,
//   qs: {domain: "uab.edu", firstName: "Darshan", lastName: "Dhameliya"},
// }, function(err, res) {
//       if(err) {
//         console.error(err);
//       } else {
//         console.log(res.body);
//       }
// });
