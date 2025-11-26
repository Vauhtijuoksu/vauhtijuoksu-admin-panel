<script setup>
import {ref, toRefs} from 'vue'
import axios from 'axios'

const props = defineProps({
  sensor: Intl
})

const { sensor } = toRefs(props);

let sensors_root = "http://vauhtisraspi.local:8000/"
//sensors_root = "http://localhost:8000/" // FOR TESTING


let rate = ref("-");
let timeout = 10000

function getRate() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", sensors_root + "sensor" + sensor.value.toString() + ".txt");
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            let response = xhr.responseText;
            if (response) {
              rate.value = response
              timeout = 1000
              document.getElementById('rate'+sensor.value).style.display = "block";
            } else {
              rate.value = 0
            }
            setTimeout(getRate, timeout);
        }
    }
    xhr.send();
}
// getRate()


</script>

<template>
  <div :id="'rate'+sensor" class="heartrate" style="display: none">
    {{ rate }}❤️
  </div>
</template>

<style scoped>
.heartrate {
  padding: 4px 8px;
}
</style>
