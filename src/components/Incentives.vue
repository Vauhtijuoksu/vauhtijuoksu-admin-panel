<script setup>
import {ref, toRefs, watch} from 'vue'
import axios from 'axios'


let incentives_url = "https://legacy.vauhtijuoksu.fi/api/incentives";
let incentives


function getIncentives() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", incentives_url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            incentives = JSON.parse(xhr.responseText);
            updateIncentives()
            setTimeout(getIncentives, 3000);
        }
    }
    xhr.send();
}


function updateIncentives() {
  var html = "";
  for (var i in incentives["incentives"]) {
    if (new Date(incentives["incentives"][i]["endtime"]) > Date.now() - 1000*60*60*2) {
      var id = incentives["incentives"][i]["id"]
      var div = "";
      div += '<div class="incentive_game">' + incentives["incentives"][i]["game"] + '</div>';
      div += '<div class="incentive_title">' + incentives["incentives"][i]["title"] + '</div>';
      if (incentives["incentives"][i]["type"] === "option") {
        var order = [];
        for (var o in incentives["incentives"][i]["parameters"].split("/")) {
          var amount = 0
          if (incentives["amount"][id.toString()]) {
            if (incentives["amount"][id.toString()][(parseInt(o) + 1).toString()]) {
              amount = incentives["amount"][id.toString()][(parseInt(o) + 1).toString()]
            }
          }
          order.push([o, amount])

        }
        order.sort(function (a, b) {
          return b[1] - a[1];
        });
        for (var j = 0; j < order.length; j++) {
          var o = order[j][0];
          var amount = 0;
          var max = 1;

          if (incentives["amount"][id.toString()]) {
            if (incentives["amount"][id.toString()][(parseInt(o) + 1).toString()]) {
              amount = incentives["amount"][id.toString()][(parseInt(o) + 1).toString()]
            }
          }
          if (incentives["max"][id.toString()]) {
            max = incentives["max"][id.toString()]
          }


          div += '<div class="ibargoal">' + amount + 'e</div>';
          div += '<div class="ibar" style="width:' + parseFloat(amount) / parseFloat(max) * 100 + '%'
          if (parseFloat(amount) >= parseFloat(max)) {
            div += '; background-color: #224754'
          }
          div += '">' + incentives["incentives"][i]["parameters"].split("/")[o] + '</div>';
        }
      } else if (incentives["incentives"][i]["type"] === "upgrade") {
        var amount = 0
        var max = incentives["incentives"][i]["parameters"]
        if (incentives["amount"][id.toString()]) {
          if (incentives["amount"][id.toString()][null]) {
            amount = incentives["amount"][id.toString()][null]
          }
        }


        div += '<div class="ibargoal">' + max + 'e</div>';
        div += '<div class="ibar" style="width:' + parseFloat(amount) / parseFloat(max) * 100 + '%'
        if (parseFloat(amount) >= parseFloat(max)) {
          div += '; background-color: #224754'
        }
        div += '">' + amount + 'e</div>';

      } else if (incentives["incentives"][i]["type"] === "open") {
        if (Object.keys(incentives["amount"]).indexOf(( 1 + parseInt(i) ).toString()) >= 0) {
          var keys = Object.keys(incentives["amount"][id]);

          var order = [];
          for (var e in incentives["amount"][id]) {
            var amount = 0
            if (incentives["amount"][id.toString()]) {
              if (incentives["amount"][id.toString()][e]) {
                amount = incentives["amount"][id.toString()][e]
              }
            }
            order.push([e, amount])

          }
          order.sort(function (a, b) {
            return b[1] - a[1];
          });
          for (var j = 0; j < order.length; j++) {
            var o = order[j][0];
            var amount = 0;
            var max = 1;

            if (incentives["amount"][id.toString()]) {
              if (incentives["amount"][id.toString()][o]) {
                amount = incentives["amount"][id.toString()][o]
              }
            }
            if (incentives["max"][id.toString()]) {
              max = incentives["max"][id.toString()]
            }


            div += '<div class="ibargoal">' + amount + 'e</div>';
            div += '<div class="ibar" style="width:' + parseFloat(amount) / parseFloat(max) * 100 + '%'
            if (parseFloat(amount) >= parseFloat(max)) {
              div += '; background-color: #224754'
            }
            div += '">' + o + '</div>';
          }
        } else {
          div += 'Tälle kannustimelle ei ole vielä ehdotuksia!'
        }
      }
      div += '</div>'
      html += '<div class="incentive">' + div + '</div>'
    }
  }
  document.getElementById("incentiveoutput").innerHTML = html;
}

getIncentives()

</script>

<template>
  <div id="incentiveoutput">
  </div>
</template>

<style scoped>
</style>
