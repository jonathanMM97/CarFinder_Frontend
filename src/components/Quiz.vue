<template>
  <div class="Quiz">

    <v-slot></v-slot>

    <div v-show="currentSlide  === i + 1 && !showProducts" class="container slide-animation" v-for="(item, i) in list" :key="i" v-bind:style="{'background-image': 'url(' + getImage() + ')'}">

      <!-- Paginación -->
      <div class="pagination-container">
        <div v-for="(slide, index) in list" :key="index" class="pagination">
          <img v-show="index + 1 >= currentSlide" src="../assets/rim.png" :style="{'opacity': index + 1 === currentSlide ? 1 : 0.4}" :class="{'fade-in-out' : index + 1 === currentSlide}">
          <img v-show="index + 1 < currentSlide" src="../assets/tyre.png">
        </div>
      </div>

      <h1>{{ i+QuestionId+1 }}. {{ item.text }}</h1>

      <div class="q-answer">
        <div v-for="(answer, j) in item.answers" :key="j">
          <label :for="'question_' + i + valorProp + '_answer_' + j" @mouseover="changeImage(answer.text)">
            <input type="radio" @click="multiCall()" :id="'question_' + i + valorProp + '_answer_' + j" :value="answer.id"  v-model="checked[i]">
              <span>{{ answer.text }}</span>
          </label>
        </div>
      </div>

      <div class="send"  v-show="finished && currentSlide === (list.length)">
        <button @click="sendAnswer" class="btn btn__link" >
          Terminar
        </button>
        <img class="submit_icon" src="../assets/wheelSubmitIcon.png">
      </div>
    </div>

    <Vehicule :filter="filter" :sortHightLow="sortHightLow" :hideCurrentIteration="hideCurrentIteration" :sortLowHight="sortLowHight" :sorterDefault="sorterDefault" :addIteration="addIteration" :showProducts="showProducts" :vehicules="vehicules" :showCarouselAgain="showCarouselAgain"></Vehicule>
  </div>
</template>



<script>
import axios from 'axios'
axios.defaults.withCredentials = true;
import Vehicule from '../components/Vehicule.vue'

import clio from "../assets/clio.png"
import smart from "../assets/smart.png"
import expensive from "../assets/expensive.png"
import jeep4x4 from "../assets/jeep4x4.png"
import oldCar from "../assets/oldCar.png"
import monovolumen from "../assets/monovolumen.png"
import priceCar from "../assets/priceCar.png"
import security from "../assets/security.png"
import sport from "../assets/sportCar.png"
import van from "../assets/cargoVan.png"
import tesla from "../assets/tesla.png"
import electric from "../assets/electric.png"

export default {
  components: {Vehicule},
  props:['valorProp', 'QuestionId', 'currentSlide', 'nextSlide', 'showProducts', 'finished', 'changeShowProducts', 'showCarouselAgain', 'addIteration', 'setCurrentSlides', 'hideCurrentIteration'],
  data() {
    return{
      filter: [],
      iconToRight: false,
      afterSend: false,
      currentIndex: 0,
      showQuiz: false,
      list: [],
      getSlideCount: null,
      checked: [],
      image: clio,
      images: [
        {link: electric, palabras:['eficiencia', 'ahorro']},
        {link: clio, palabras:['funcional', 'diarios', 'funcional', 'prioridad', 'preocupación', 'preferencia', 'equilibrio', 'convencionales', 'importancia', 'media']},
        {link: smart, palabras:['ahorro', 'urbano', 'ciudad', 'calle', 'novato', 'reducidos']},
        {link: expensive, palabras:['lujo', 'clásico', 'elegante', 'reuniones', 'no tenga uso', 'sofisticado']},
        {link: jeep4x4, palabras:['aventurero', 'libertad', 'irregulares', 'mercancia', 'aire']},
        {link: oldCar, palabras:['usado']},
        {link: monovolumen, palabras:['espacio', 'largos', 'familia', 'relajada', 'road', 'confort', 'cómoda', 'sin requerir']},
        {link: security, palabras:['seguridad']},
        {link: sport, palabras:['dinámico', 'potencia', 'deportiva', 'rendimiento', 'experimentado', 'llamativo', 'deportivo']},
        {link: van, palabras:['mercancías', 'carga', 'equipaje', 'amplio']},
        {link: tesla, palabras:['avances', 'tecnológicos', 'uso']},
      ],
      vehicules: []
    }
  },
  methods: {
    async sendAnswer() {
      await axios.post("http://localhost:8080/quiz/answer/bulk",this.checked);
      this.sorterDefault();
      this.changeShowProducts();
      this.getFilters();
      this.afterSend = true;
    },
    async getFilters() {
      const fil = await axios.get("http://localhost:8080/quiz/higher", {withCredentials: true});
      this.filter = fil.data;
      let iterations = fil.length;
      let aux = 0;

      for(const cadena of this.filter)
      {
        aux += cadena.value;
        for(let i = 0 ; i < cadena.internalIdentificator.length ; i++)
          if(cadena.internalIdentificator[i].toUpperCase() === cadena.internalIdentificator[i])
          {
            cadena.internalIdentificator = cadena.internalIdentificator.substring(i);
          }
      }

      for(const cadena of this.filter)
      {
        cadena.value = parseInt((cadena.value * 100)/aux);
      }
    },
    async sortHightLow() {
      await axios.get("http://localhost:8080/quiz/result/2", {withCredentials: true})
      .then(response => this.vehicules = response.data);
    },
    async sortLowHight() {
      await axios.get("http://localhost:8080/quiz/result/1", {withCredentials: true})
      .then(response => this.vehicules = response.data);
    },
    async sorterDefault() {
      await axios.get("http://localhost:8080/quiz/result", {withCredentials: true})
      .then(response => this.vehicules = response.data);
    },
    changeImage(answerText){
      for(const item of this.images)
      {
        for(const word of item.palabras)
        {
          if(answerText.includes(word))
          {
            this.image = item.link;
          }
        }
      }
    },
    getImage() {
      return this.image;
    },
    isActive(index) {
      console.log(this.currentPageIndex ? 1 : 0.2);
      return index <= this.currentPageIndex ? 1 : 0.2;
    },
    nextCurrentIndex() {
      console.log("Incrementado");
      this.currentIndex++;
    },
    multiCall() {
      this.nextSlide();
      this.nextCurrentIndex();
    }
  },
  computed: {
    currentSlideIndex() {
      return this.currentIndex;
    },
  },
  async mounted(){
    this.getSlideCount = document.querySelectorAll(".container").length;
    this.vehicules = [];
    let result = await axios.get("http://localhost:8080/quiz/round", {withCredentials: true});
    if(result.data.length === 0)
    {
      let confirmResult = window.confirm('¿Quiere restablecer sus respuestas y comenzar el cuestionario de nuevo?');
      if (confirmResult) {
        let response = await axios.post("http://localhost:8080/quiz/reestablish", {withCredentials: true});
        console.log(response);
        confirmResult = window.confirm('Se reestablecieron las respuestas...');
      }
      result = await axios.get("http://localhost:8080/quiz/round", {withCredentials: true});
    }
    console.log(result.data);
    this.list = result.data;
    this.setCurrentSlides(this.list.length);
    console.log(result.data);
  }
}

</script>



<style lang="scss" scoped>


.container {
  position: absolute;
  background-size: cover;
  background-position: bottom center;
  transition: background-image 0.5s ease;
  opacity: 0;
  left: 0;
  width: 100%;
  height: 100vh;

  h1 {
    font-size: 32px;
    font-family: 'Lato', sans-serif;
    text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.5), 8px 8px 10px rgba(0, 0, 0, 0.4);
    text-transform: uppercase;
    text-align: center;
    color: #fff;
  }

  .q-answer {
    position: relative;
    z-index: 1;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 31px;
    justify-content: center;
    margin: 10px 30vh;
    margin-top: 20rem;
    padding: 8px;
    display: flex;
    gap: 10px;
  }

  @media (max-width: 980px) {
    .q-answer {
      top: 0;
    }
  }

  input[type="radio"] {
    display: none;
  }

  label {
    display: block;
    cursor: pointer;
    font-weight: 500;
    margin-bottom: 10px;
  }

  label span{
    text-transform: uppercase;
    display: inline-flex;
    align-items: center;
    padding: 10px 20px 10px 10px;
    border-radius: 31px;
    color: #fff;
    transition: 0.25s;
  }


  label span:hover,
  input[type="radio"]:checked + span{
    background: #b5b3b3;
    color: black;
  }

  label span:before {
    visibility: hidden;
  }

  input[type="radio"]:checked + span:before {
    box-shadow: inset 0 0 0 10px #00005c;
  }

    .send {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;

      .submit_icon {
        position: absolute;
        width: 60px;
        height: 60px;
        right: 54.5%;
        z-index: 2;
        transition: transform 0.4s ease;
      }

      .btn__link:hover + .submit_icon {
          transform: rotate(180deg);
      }

      .btn{
          background: #161719;
          padding: 10px 50px;
          font-size: 20px;
          font-family: 'Montserrat';
          text-decoration: none;
          cursor: pointer;
          border-radius: 10%;
          transition: 0.8s;
          position: relative;
          z-index: 1;
          overflow: hidden;
          color: #fff;

        &__link:hover {
          background: #afaeb3;
          color: rgba(0, 0, 0, 0.8);
        }

        &:active {
          background: #9d3426;
        }

        /*&:active + .submit_icon {
          animation: rotateAndTranslate 0.5s forwards;
        }*/
      }
    }
    /*@keyframes rotateAndTranslate {
      0% {
        transform: translateX(0%) rotate(0deg);
      }
      100% {
        transform: translateX(315%) rotate(180deg);
      }
    }*/
  }

  .slide-animation {
  /* Animación de entrada */
  animation: slideIn 0.5s forwards;
}

.slide-animation.exit-active {
  /* Animación de salida */
  animation: slideOut 0.5s forwards;
}


  @keyframes slideIn {
  from {
    background-position: bottom center; /* Desplazar la imagen de fondo hacia abajo */
    opacity: 0;
  }
  to {
    background-position: top center; /* Desplazar la imagen de fondo hacia arriba */
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    background-position: top center; /* Desplazar la imagen de fondo hacia arriba */
    opacity: 1;
  }
  to {
    background-position: bottom center; /* Desplazar la imagen de fondo hacia abajo */
    opacity: 0;
  }
}

@media (max-width: 980px) {
  .container {
    margin-top: 5rem;
    margin-left: 1rem;
  }
  

  .send {
    .btn {
      .btn__link{
        font-size: 10px;
      }
    }
  }

  label span{
    font-size: 10px;
  }
}

.pagination-container {
  margin-top: 6.7rem;
  display: flex;         /* Configuración de flexbox */
  height: 10vh;
  flex-direction: row;  /* Asegura que los elementos estén en una línea */
  justify-content: center; /* Opcional: centrar los elementos horizontalmente */
  align-items: center;
}

.pagination {
  /* Estilos adicionales para cada elemento de paginación, si es necesario */
  margin-left: 100px; /* Ejemplo de margen entre elementos */
  margin-right: 100px;
}
.pagination img {
  width: 50px;
  height: 50px;
  opacity: 0.4;
}

.fade-in-out {
  animation: fadeInOut 0.8s ease;
}

.fade-in-out:hover {
  scale: 1.2;
}

@keyframes fadeInOut {
  0%, 50% {
    rotate: 0;
  }
  100% {
    rotate: 180deg;
  }
}
</style>