var DataFrame = require('dataframe-js').DataFrame;
const path = 'https://www.dropbox.com/sh/qwh4b6e7vvqes6x/AABvZYZaMkSdmICQST2edcica/IRC-Thompson/2019-04-08_priordata.csv'

const dfs = require('dropbox-fs')({
    apiKey: 'Xs_0RUdduGAAAAAAAAAAITcC6NxxIWl6DNwYHq5GIuZJfz4lEyc8Bbdf8JSg1w-l'
});

var isExists = false

const stratum = new DataFrame(
    [
        [ 0, 'syrian','male',0,0 ],
        [ 1, 'syrian','male',0,1 ],
        [ 2, 'syrian','male',1,0 ],
        [ 3, 'syrian','male',1,1 ],
        [ 4, 'syrian','female',0,0 ],
        [ 5, 'syrian','female',0,1 ],
        [ 6, 'syrian','female',1,0 ],
        [ 7, 'syrian','female',1,1 ],
        [ 8, 'jordanian','male',0,0 ],
        [ 9,  'jordanian','male',0,1 ],
        [ 10, 'jordanian','male',1,0 ],
        [ 11, 'jordanian','male',1,1 ],
        [ 12, 'jordanian','female',0,0 ],
        [ 13, 'jordanian','female',0,1 ],
        [ 14, 'jordanian','female',1,0 ],
        [ 15, 'jordanian','female',1,1 ],
    ],
    ['id', 'nationality', 'gender', 'above_secondary_edu', 'ever_employed']
);

window.onload = function() {
    var form = document.querySelector("form");
    form.onsubmit = submitted.bind(form);
};


function appendLeadingZeroes(n){
  if(n <= 9){
    return "0" + n;
  }
  return n
}

function getStrata() {
    let answers = $('#form').serialize().split('&').map((answer) => answer.split('='));
    const nationality = answers[0][1];
    const gender = answers[1][1];
    const above_secondary_edu = answers[2][1];
    const ever_employed = answers[3][1];
    return stratum.filter(row => {
        return row.get('nationality') == nationality &&
            row.get('gender') == gender &&
            row.get('above_secondary_edu') == above_secondary_edu &&
            row.get('ever_employed') == ever_employed;
    }).toDict()['id'][0];
}


function submitted(event) {
    event.preventDefault();



    const strata = getStrata();
    console.log(strata);

    let now = (new Date());
    date_today = appendLeadingZeroes(now.getFullYear()) +  '-' + appendLeadingZeroes((now.getMonth() + 1)) + '-' + appendLeadingZeroes(now.getDate()); 
    dfs.readFile('/' + date_today + '_treatmentprobabilities.csv', (err, result) => {
        
      if(!err){
          DataFrame.fromCSV('https://theirc-tashbeek-staging.azurewebsites.net/thompson-probs/')
            .then(df => {
                const probs = df.toArray()[strata].map(parseFloat);
                const rand = Math.random();
                const prob1 = probs[0] + probs[1];
                const prob2 = prob1 + probs[2];
                $('#form').hide();

                if (rand < probs[0]) {
                    $('#cash').show();
                } else if (rand > probs[0] && rand <= prob1) {
                    $('#information').show();
                } else if (rand > prob1 && rand <= prob2){
                    $('#psych').show();
                } else {
                    $('#control').show();
                }
                let info = `rand: ${rand}, probs: ${probs}`;
                gtag('event', 'submit', {
                    'event_category': 'Randomize',
                    'event_label': info,
                });

                alertify.success('Response Submitted');

            });


      }
      else{
            alertify.error('Can\'t find the file ' + date_today + '_treatmentprobabilitiess.csv in the Dropbox folder');
      }

    
    });
  
};
