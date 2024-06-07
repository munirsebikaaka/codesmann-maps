'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coord, distance, duration) {
    this.coord = coord;
    this.distance = distance;
    this.duration = duration;
  }
}
class Running extends Workout {
  activities = [];
  constructor(coord, distance, duration, cadence) {
    super(coord, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  constructor(coord, distance, duration, elevetionGain) {
    super(coord, distance, duration);
    this.elevetionGain = elevetionGain;
    this.calcSpeed();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
class App {
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this.getPosition();
    form.addEventListener('submit', this.newWorkout.bind(this));
    inputType.addEventListener('change', this.toogleElevetionFields);
  }
  getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this.loadMap.bind(this),
        function () {
          alert('coulnt find ur location');
        }
      );
  }
  loadMap(postion) {
    const latitude = postion.coords.latitude;
    const longitude = postion.coords.longitude;
    console.log(latitude);
    console.log(
      longitude,
      `https://www.google.com/maps/@${latitude},${longitude}`
    );
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this.showForm.bind(this));
  }
  showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  toogleElevetionFields() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
  newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(input => input > 0);
    e.preventDefault();
    // get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workout;
    // if workout Running create a running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // check if data  is valid
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('inputs have to be positive numbers');
      workout = new Running([lat, lng], distance, duration, cadence);
    }
    // if workout recycling create a recycling object
    if (type === 'cycling') {
      const elevetion = +inputElevation.value;
      if (
        !validInputs(distance, duration, elevetion) ||
        !allPositive(distance, duration)
      )
        return alert('inputs have to be positive numbers');
      workout = new Cycling([lat, lng], distance, duration, elevetion);
    }
    //add new object to workout array
    this.#workouts.push(workout);
    console.log(workout);

    //render the workout on the map maker
    inputCadence.value =
      inputDuration.value =
      inputDistance.value =
      inputElevation.value =
        '';
    const latlng = this.#mapEvent.latlng;
    const lat = latlng.lat;
    const lng = latlng.lng;
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: 'running-popup',
        })
      )
      .setPopupContent('codesmann workout')
      .openPopup();
  }
}
const app = new App();
