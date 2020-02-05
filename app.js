M.AutoInit()
const appid = '1f0b9b5f1416e91ca33f24eafe607729'
const history = JSON.parse(localStorage.getItem('openweathermap')) || []
let init = true

const setListener = _ => {
  document.getElementById('wLookup').addEventListener('click', event => {
    event.preventDefault()
    fetchData(document.getElementById('wSearch').value)
  })
  document.getElementById('wHistory').addEventListener('click', event => {
    event.preventDefault()
    fetchData(event.target.textContent)
  })
}

const updateHistory = (x = false) => {
  if (x) {
    const index = history.indexOf(x)
    if (index > 0) {
      history.splice(index, 1)
    } else if (history.length > 10) {
      history.pop()
    }
    if (index !== 0) { history.unshift(x) }
  }
  document.getElementById('wHistory').innerHTML = ''
  for (let i = 0; i < history.length; i++) {
    if (history[i] !== '') {
      document.getElementById('wHistory').innerHTML += `<a class="collection-item">${history[i]}</a>`
    }
  }
  localStorage.setItem('openweathermap', JSON.stringify(history))
}

const fetchData = x => {
  if (!x) {
    M.Modal.init(document.getElementById('errorModal')).open()
    return
  }
  fetch(`http://api.openweathermap.org/data/2.5/weather?q=${x}&appid=${appid}`)
    .then(r => r.json())
    .then(data => {
      // console.log(data)
      if (data.cod === '404') {
        M.Modal.init(document.getElementById('errorModal')).open()
        return
      }
      document.getElementById('wCity').textContent = data.name
      document.getElementById('wCond').textContent = data.weather[0].main
      document.getElementById('wTime').textContent = moment.unix(data.dt).format('MMM D, YYYY h:mm a')
      document.getElementById('wTemp').textContent = tempConv(data.main.temp)
      document.getElementById('wHumi').textContent = data.main.humidity
      document.getElementById('wWind').textContent = speedConv(data.wind.speed)
      document.getElementById('wIcon').className = 'wi wi-owm-' + data.weather[0].id
      fetch(`http://api.openweathermap.org/data/2.5/uvi?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${appid}`)
        .then(r => r.json())
        .then(uvData => {
          // console.log(uvData)
          document.getElementById('wUV').textContent = Math.round(uvData.value)
          if (uvData.value > 8) {
            document.getElementById('wUV').style = 'background-color:red'
          } else if (uvData.value > 6) {
            document.getElementById('wUV').style = 'background-color:orange'
          } else if (uvData.value > 3) {
            document.getElementById('wUV').style = 'background-color:yellow'
          } else {
            document.getElementById('wUV').style = 'background-color:green'
          }
        })
        .catch(e => console.error(e))
      if (!init) {
        updateHistory(data.name)
      } else {
        updateHistory()
        init = false
      }
    })
    .catch(e => {
      console.error(e)
    })

  fetch(`http://api.openweathermap.org/data/2.5/forecast?q=${x}&APPID=${appid}`)
    .then(r => r.json())
    .then(data => {
      // console.log(data)
      if (data.cod === '404') return
      document.getElementById('wFore').innerHTML = ''
      for (let i = 0; i < 40; i++) {
        const day = data.list[i]
        hour = moment.unix(day.dt).format('H')
        // console.log(moment.unix(day.dt).format('H'))
        if (hour === '14' || hour === '15' || hour === '16') {
          document.getElementById('wFore').innerHTML += `
<div class="col s12 m2">
  <div class="card-panel">
    <span class="white-text">
      <h6>${moment.unix(day.dt).format('M/D/YYYY')}</h6>
      <i class="wi wi-owm-${day.weather[0].id}"></i>
      <p>High: ${tempConv(day.main.temp)}℉</p>
      <p>Humidity: ${day.main.humidity}%</p>
    </span>
  </div>
</div>
`
        }
      }
    })
    .catch(e => console.error(e))
}

const tempConv = k => {
  return Math.round((((k - 273.15) * 9 / 5) + 32) * 10) / 10
}

const speedConv = m => {
  return Math.round(m * 22.37) / 10
}

setListener()
fetchData('Los Angeles')
