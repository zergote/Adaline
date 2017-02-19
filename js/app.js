//==============Parametros Generales================
var cantidadPuntos = 100;
var cantidadConjDeEvaluacion = 1000;
var x0 = 1; //Bias de la red

// Variables globales del generador de problema
var rectaDeGenerador = [];
var puntosProblema = [];
var mProblema = 0.5; // valor entre 0.1 y 1
var bProblema = 1; // valor entre 0 y 10
var dataProblema = [];
var pointsBlue = [];
var pointsRed = [];
var iteraciones = 0;

// Variables globales de la uP
var uPObject = null;
var generadorObject = null;

//Ecuaciones resueltas
var division = 10 / Math.sqrt(cantidadConjDeEvaluacion);

//Colores
var colorPuntosSinClasificar = "#EE0000";
var colorPuntosErrados = "#FF1493";
var colorPuntosAcertados = "#00FF7F";
var colorPuntosRecta = "#2F4F4F";
var colorPuntosUp = "#1E90FF";
var colorPuntosDown = "#CD853F";

// Objeto UP
var uP = function() {
  this.x1 = null;
  this.x2 = null;

  this.w0 = Math.random() * 10;
  this.w1 = Math.random() * 10;
  this.w2 = Math.random() * 10;

  this.variablesCambiadas = 0;
  this.hiperPlanoEncontrado = false;

  this.mUp = null;
  this.bUp = null;

  this.hiperPlanoNeurona = [];

  this.fCambio = 0.1;

  this.cola = [];

  this.entrenada = false;

  this.comprobarRedundancia = function(n) {
    if (n === 0) {
      return true;
    } else {
      var contador = 0;
      var tamañoBuffer = 90;
      var tazaDeOcurrencias = 30;
      this.cola.push(n);
      if (this.cola.length == tamañoBuffer) {
        for (var i = 0; i < this.cola.length; i++) {
          if (this.cola[i] == n) contador++;
        }
        this.cola.shift();
      }
      if (contador >= tazaDeOcurrencias) {
        return true;
      } else {
        return false;
      }
    }
  };
  this.pasoAPaso = function() {
    $("#evaluate").prop("disabled", false);
    $("#evaluate").css({
      "background-color": "lightpink",
      color: "black",
      "text-align": "center",
      "text-decoration": "none",
      display: "inline-block",
      cursor: "pointer"
    });
    $("#load").prop("disabled", false);
    $("#load").css({
      "background-color": "lightpink",
      color: "black",
      "text-align": "center",
      "text-decoration": "none",
      display: "inline-block",
      cursor: "pointer"
    });
    $("#geconeval").prop("disabled", false);
    $("#geconeval").css({
      "background-color": "lightpink",
      color: "black",
      "text-align": "center",
      "text-decoration": "none",
      display: "inline-block",
      cursor: "pointer"
    });

    this.hiperPlanoEncontrado = false;
    for (var i = 0; i < cantidadPuntos; i++) {
      var signoUp = this.evaluarSignoUp(dataProblema[i][0], dataProblema[i][1]);
      var signoOri = puntosProblema[i].s;
      if (signoUp != signoOri) {
        this.algoritmoDeAprendizaje(i);
        this.variablesCambiadas++;
      }
    }
    console.log(this.variablesCambiadas);
    console.log(
      "Ec. Recta y=mx+b con m=" +
        ((-this.w1) / this.w2).toFixed(2) +
        " y b=" +
        ((-this.w0) / this.w2).toFixed(2)
    );
    iteraciones++;
    this.GraficarPlanoActualEntrenamiento(-1);
    if (this.comprobarRedundancia(this.variablesCambiadas)) {
      alert("Hiperplano encontrado!");
    }
    this.entrenada = true;
    this.variablesCambiadas = 0;
  };

  this.cargarProblemaDeEvaluacion = function() {
    var myChart = Highcharts.chart("gEntrenamiento", {
      chart: {
        type: "scatter"
      },
      title: {
        text: "Neurona Entrenada"
      },
      subtitle: {
        text: "Solución que aporta la neurona"
      },
      xAxis: {
        title: {
          text: "Eje X"
        }
      },
      yAxis: {
        title: {
          text: "Eje Y"
        }
      },
      plotOptions: {
        series: {
          animation: false
        }
      },
      series: [
        {
          name: "Puntos",
          color: colorPuntosSinClasificar,
          data: dataProblema
        },
        {
          type: "line",
          name: (
            "Ec. Recta y=mx+b con m=" +
              ((-this.w1) / this.w2).toFixed(2) +
              " y b=" +
              ((-this.w0) / this.w2).toFixed(2)
          ),
          lineWidth: 0.5,
          color: colorPuntosRecta,
          data: this.hiperPlanoNeurona
        }
      ]
    });
  };

  this.evaluarSignoUp = function(x, y) {
    //var posicion = y - (this.w1 / this.w2) * x - (this.w0 / this.w2);
    var posicion = x0 * this.w0 + x * this.w1 + y * this.w2;
    if (posicion >= 0) {
      return 1;
    }
    if (posicion < 0) {
      return -1;
    }
  };

  //Funciones de activacion
  this.evaluarSignoUpTanH = function(x, y) {
    var posicion = x0 * this.w0 + x * this.w1 + y * this.w2;
    return 1.0 - Math.pow(Math.tanh(posicion), 2);
  };

  this.calculoDeRecta = function(x) {
    return this.w1 / this.w2 * x + this.w0 / this.w2;
  };

  this.calculoDeHiperPlanoNeurona = function(signo) {
    this.hiperPlanoNeurona = [];
    for (var i = 0; i <= 10; i++) {
      this.hiperPlanoNeurona.push([i, signo * this.calculoDeRecta(i)]);
    }
  };

  this.algoritmoDeAprendizaje = function(i) {
    this.w0 += this.fCambio *
      (puntosProblema[i].s -
        this.evaluarSignoUpTanH(dataProblema[i][0], dataProblema[i][1])) *
      x0;
    this.w1 += this.fCambio *
      (puntosProblema[i].s -
        this.evaluarSignoUpTanH(dataProblema[i][0], dataProblema[i][1])) *
      dataProblema[i][0];
    this.w2 += this.fCambio *
      (puntosProblema[i].s -
        this.evaluarSignoUpTanH(dataProblema[i][0], dataProblema[i][1])) *
      dataProblema[i][1];
  };

  this.calcularError = function() {
    var numeroDePuntosAProbar = 100000;
    var erroresEncontrados = 0;
    for (var i = 0; i < numeroDePuntosAProbar; i++) {
      var px = (Math.random() * 10).toFixed(2);
      var py = (Math.random() * 10).toFixed(2);
      var ps = generadorObject.evaluarSigno(px, py);
      if (this.evaluarSignoUp(px, py) !== ps) {
        erroresEncontrados++;
      }
    }
    return erroresEncontrados / numeroDePuntosAProbar;
  };

  this.actualizarDatos = function() {
    $("#peso0").text(this.w0 + " |  ");
    $("#peso1").text(this.w1 + " |  ");
    $("#peso2").text(this.w2 + " |  ");
    $("#iteracion").text(iteraciones + " |  ");
    if (iteraciones > 0) {
      $("#error").text(this.calcularError());
    } else {
      $("#error").text("-----");
    }
  };

  this.inicializarUp = function() {
    $("#load").prop("disabled", true);
    $("#load").css({
      "background-color": "gray",
      color: "white",
      "text-align": "center",
      "text-decoration": "none",
      display: "inline-block",
      cursor: "pointer"
    });
    $("#entrepaso").prop("disabled", false);
    $("#entrepaso").css({
      "background-color": "lightskyblue",
      color: "black",
      "text-align": "center",
      "text-decoration": "none",
      display: "inline-block",
      cursor: "pointer"
    });
    $("#entreauto").prop("disabled", false);
    $("#entreauto").css({
      "background-color": "lightskyblue",
      color: "black",
      "text-align": "center",
      "text-decoration": "none",
      display: "inline-block",
      cursor: "pointer"
    });
    $("#evaluate").prop("disabled", true);
    $("#evaluate").css({
      "background-color": "gray",
      color: "white",
      "text-align": "center",
      "text-decoration": "none",
      display: "inline-block",
      cursor: "pointer"
    });
    this.w0 = Math.random();
    this.w1 = Math.random();
    this.w2 = Math.random();
    this.hiperPlanoNeurona = false;
    this.GraficarPlanoActualEntrenamiento(1);
    this.actualizarDatos();
    iteraciones = 0;
    this.entrenada = false;
  };

  this.GraficarPlanoActual = function(signo) {
    this.calculoDeHiperPlanoNeurona(signo);
    this.actualizarDatos();

    var myChart = Highcharts.chart("gEntrenamiento", {
      chart: {
        type: "scatter"
      },
      title: {
        text: "Neurona Entrenada"
      },
      subtitle: {
        text: "Solución que aporta la neurona"
      },
      xAxis: {
        title: {
          text: "Eje X"
        }
      },
      yAxis: {
        title: {
          text: "Eje Y"
        }
      },
      plotOptions: {
        series: {
          animation: false
        }
      },
      series: [
        {
          name: "Puntos",
          color: colorPuntosSinClasificar,
          data: dataProblema
        },
        {
          type: "line",
          name: (
            "Ec. Recta y=mx+b con m=" +
              (signo * this.w1 / this.w2).toFixed(2) +
              " y b=" +
              (signo * this.w0 / this.w2).toFixed(2)
          ),
          lineWidth: 0.5,
          color: colorPuntosRecta,
          data: this.hiperPlanoNeurona
        }
      ]
    });
  };
  this.GraficarPlanoActualEntrenamiento = function(signo) {
    this.calculoDeHiperPlanoNeurona(signo);
    this.actualizarDatos();

    var myChart = Highcharts.chart("gEntrenamiento", {
      chart: {
        type: "scatter"
      },
      title: {
        text: "Neurona Entrenada"
      },
      subtitle: {
        text: "Solución que aporta la neurona"
      },
      xAxis: {
        title: {
          text: "Eje X"
        }
      },
      yAxis: {
        title: {
          text: "Eje Y"
        }
      },
      plotOptions: {
        series: {
          animation: false
        }
      },
      series: [
        {
          name: "Puntos sobre la recta",
          color: colorPuntosUp,
          data: pointsRed
        },
        {
          name: "Puntos bajo la recta",
          color: colorPuntosDown,
          data: pointsBlue
        },
        {
          type: "line",
          name: (
            "Ec. Recta y=mx+b con m=" +
              (signo * this.w1 / this.w2).toFixed(2) +
              " y b=" +
              (signo * this.w0 / this.w2).toFixed(2)
          ),
          lineWidth: 0.5,
          color: colorPuntosRecta,
          data: this.hiperPlanoNeurona
        }
      ]
    });
  };
  this.entrenarUp = function() {
    $("#evaluate").prop("disabled", false);
    $("#evaluate").css({
      "background-color": "lightpink",
      color: "black",
      "text-align": "center",
      "text-decoration": "none",
      display: "inline-block",
      cursor: "pointer"
    });
    $("#load").prop("disabled", false);
    $("#load").css({
      "background-color": "lightpink",
      color: "black",
      "text-align": "center",
      "text-decoration": "none",
      display: "inline-block",
      cursor: "pointer"
    });
    $("#geconeval").prop("disabled", false);
    $("#geconeval").css({
      "background-color": "lightpink",
      color: "black",
      "text-align": "center",
      "text-decoration": "none",
      display: "inline-block",
      cursor: "pointer"
    });
    iteraciones = 0;
    this.entrenada = true;
    this.hiperPlanoEncontrado = false;
    while (this.hiperPlanoEncontrado === false) {
      for (var i = 0; i < cantidadPuntos; i++) {
        var signoUp = this.evaluarSignoUp(
          dataProblema[i][0],
          dataProblema[i][1]
        );
        var signoOri = puntosProblema[i].s;
        if (signoUp != signoOri) {
          this.algoritmoDeAprendizaje(i);
          this.variablesCambiadas++;
        }
      }
      if (this.comprobarRedundancia(this.variablesCambiadas)) {
        this.hiperPlanoEncontrado = true;
      }
      this.variablesCambiadas = 0;
      console.log(
        "Ec. Recta y=mx+b con m=" +
          (this.w1 / this.w2).toFixed(2) +
          " y b=" +
          (this.w0 / this.w2).toFixed(2)
      );
      iteraciones++;
    }
    this.GraficarPlanoActualEntrenamiento(-1);
  };

  this.evaluarAprendizaje = function() {
    var signo = 1;
    if (this.entrenada) {
      signo = -1;
    }
    //this.calculoDeHiperPlanoNeurona(signo);
    this.actualizarDatos();
    var puntosErrados = [];
    var puntosAcertados = [];
    for (var i = 0; i < dataProblema.length; i++) {
      var signoUp = this.evaluarSignoUp(dataProblema[i][0], dataProblema[i][1]);
      var signoOri = puntosProblema[i].s;
      if (signoUp == signoOri) {
        puntosAcertados.push([dataProblema[i][0], dataProblema[i][1]]);
      } else {
        puntosErrados.push([dataProblema[i][0], dataProblema[i][1]]);
      }
    }

    var chartSolucion = Highcharts.chart("gEntrenamiento", {
      chart: {
        type: "scatter"
      },
      title: {
        text: "Resultado de evaluación"
      },
      subtitle: {
        text: (
          "Nivel de precision de neurona " +
            (puntosAcertados.length * 100 / dataProblema.length).toFixed(2) +
            " %"
        )
      },
      xAxis: {
        title: {
          text: "Eje X"
        }
      },
      yAxis: {
        title: {
          text: "Eje Y"
        }
      },
      plotOptions: {
        series: {
          animation: false
        }
      },
      series: [
        {
          name: "Puntos acertados [" + puntosAcertados.length + "]",
          color: colorPuntosAcertados,
          data: puntosAcertados
        },
        {
          name: "Puntos errados [" + puntosErrados.length + "]",
          color: colorPuntosErrados,
          data: puntosErrados
        },
        {
          name: (
            "Ec. Recta y=mx+b con m=" +
              (signo * this.w1 / this.w2).toFixed(2) +
              " y b=" +
              (signo * this.w0 / this.w2).toFixed(2)
          ),
          type: "line",
          lineWidth: 0.5,
          color: colorPuntosRecta,
          data: this.hiperPlanoNeurona
        }
      ]
    });
  };
};

// =========================Generador de poblema de la
// aplicacion==============================
var Generador = function() {
  // Restablecer Variables
  this.reestablecerProblema = function() {
    $("#geconeval").prop("disabled", true);
    $("#geconeval").css({
      "background-color": "gray",
      color: "white",
      "text-align": "center",
      "text-decoration": "none",
      display: "inline-block",
      cursor: "pointer"
    });
    rectaDeGenerador = [];
    puntosProblema = [];
    dataProblema = [];
    pointsBlue = [];
    pointsRed = [];
    var myChart = Highcharts.chart("gProblema", {
      chart: {
        type: "scatter"
      },
      title: {
        text: "Problema Generado"
      },
      subtitle: {
        text: "Puntos creados al azar"
      },
      xAxis: {
        title: {
          text: "Eje X"
        }
      },
      yAxis: {
        title: {
          text: "Eje Y"
        }
      },
      series: [
        {
          name: "Puntos sobre la recta",
          color: colorPuntosUp,
          data: [[2, 7]]
        },
        {
          name: "Puntos bajo la recta",
          color: colorPuntosDown,
          data: [[8, 1]]
        },
        {
          type: "line",
          name: "Ec. Recta",
          color: colorPuntosRecta,
          lineWidth: 0.5,
          data: [
            [0, 1],
            [1, 1.5],
            [2, 2],
            [3, 2.5],
            [4, 3],
            [5, 3.5],
            [6, 4],
            [7, 4.5],
            [8, 5],
            [9, 5.5],
            [10, 6]
          ]
        }
      ]
    });
  };

  // Generador de puntos de generador de problema
  this.ecRecta = function(x) {
    return mProblema * x + bProblema;
  };

  this.evaluarSigno = function(x, y) {
    // var posicion = y - mProblema * x - bProblema;
    var posicion = y - mProblema * x - bProblema;
    // var posicion = y - mProblema * x - bProblema;
    if (posicion >= 0) {
      return 1;
    }
    if (posicion < 0) {
      return -1;
    }
  };

  this.graficarPuntosProblema = function() {
    var myChart = Highcharts.chart("gProblema", {
      chart: {
        type: "scatter"
      },
      title: {
        text: "Problema Generado"
      },
      subtitle: {
        text: "Puntos creados al azar"
      },
      xAxis: {
        title: {
          text: "Eje X"
        }
      },
      yAxis: {
        title: {
          text: "Eje Y"
        }
      },
      series: [
        {
          name: "Puntos sobre la recta",
          color: colorPuntosUp,
          data: pointsRed
        },
        {
          name: "Puntos bajo la recta",
          color: colorPuntosDown,
          data: pointsBlue
        },
        {
          name: "Ec. Recta y=mx+b con m=" + mProblema + " y b=" + bProblema,
          type: "line",
          lineWidth: 0.5,
          color: colorPuntosRecta,
          data: rectaDeGenerador
        }
      ]
    });
  };

  this.generarRectaProblema = function() {
    for (var i = 0; i <= 10; i++) {
      rectaDeGenerador.push([i, this.ecRecta(i)]);
    }
  };

  this.generarPuntosEntrenamiento = function() {
    $("#iniciarup").prop("disabled", false);
    $("#iniciarup").css({
      "background-color": "lightgreen",
      color: "black",
      "text-align": "center",
      "text-decoration": "none",
      display: "inline-block",
      cursor: "pointer"
    });
    $("#reset").prop("disabled", false);
    $("#reset").css({
      "background-color": "lightgreen",
      color: "black",
      "text-align": "center",
      "text-decoration": "none",
      display: "inline-block",
      cursor: "pointer"
    });
    rectaDeGenerador = [];
    puntosProblema = [];
    dataProblema = [];
    pointsBlue = [];
    pointsRed = [];
    mProblema = parseFloat(Math.random().toFixed(2));
    bProblema = parseFloat((Math.random() * 7).toFixed(2));

    var nroPuntos = 0;
    var punto = function(umbral, x, y, s) {
      this.punto = [x0, x, y];
      this.s = s;
    };

    while (nroPuntos < cantidadPuntos) {
      var px = (Math.random() * 10).toFixed(2);
      var py = (Math.random() * 10).toFixed(2);
      var ps = this.evaluarSigno(px, py);
      if (ps >= 0) {
        pointsRed.push([parseFloat(px), parseFloat(py)]);
      }
      if (ps < 0) {
        pointsBlue.push([parseFloat(px), parseFloat(py)]);
      }
      puntosProblema.push(new punto(1, px, py, ps));
      nroPuntos++;
    }

    for (var i = 0; i < cantidadPuntos; i++) {
      dataProblema.push([
        parseFloat(puntosProblema[i].punto[1]),
        parseFloat(puntosProblema[i].punto[2])
      ]);
    }

    this.generarRectaProblema();
    this.graficarPuntosProblema();
  };

  this.generarPuntosEvaluacion = function() {
    puntosProblema = [];
    dataProblema = [];
    pointsBlue = [];
    pointsRed = [];

    var nroPuntos = 0;
    var punto = function(umbral, x, y, s) {
      this.punto = [umbral, x, y];
      this.s = s;
    };

    for (var i = 0; i < 10; i += division) {
      for (var j = 0; j < 10; j += division) {
        var px = j.toFixed(2);
        var py = i.toFixed(2);
        var ps = this.evaluarSigno(px, py);
        if (ps >= 0) {
          pointsRed.push([parseFloat(px), parseFloat(py)]);
        }
        if (ps < 0) {
          pointsBlue.push([parseFloat(px), parseFloat(py)]);
        }
        puntosProblema.push(new punto(this.x0, px, py, ps));
      }
    }
    // while (nroPuntos < cantidadConjDeEvaluacion) {     var px = (Math.random() *
    // 10).toFixed(2);     var py = (Math.random() * 10).toFixed(2);     var ps =
    // this.evaluarSigno(px, py);     if (ps >= 0) { pointsRed.push([parseFloat(px),
    // parseFloat(py)]);     }     if (ps < 0) { pointsBlue.push([parseFloat(px),
    // parseFloat(py)]);     } puntosProblema.push(new punto(this.x0, px, py, ps));
    //    nroPuntos++; }

    for (var x = 0; x < puntosProblema.length; x++) {
      dataProblema.push([
        parseFloat(puntosProblema[x].punto[1]),
        parseFloat(puntosProblema[x].punto[2])
      ]);
    }

    this.graficarPuntosProblema();
  };
};

// =========================Estado Inicial De
// Aplicacion============================== Grafica de la solucion
$(function() {
  //Deshabilita botones
  $("#reset").prop("disabled", true);
  $("#reset").css({
    "background-color": "gray",
    color: "white",
    "text-align": "center",
    "text-decoration": "none",
    display: "inline-block",
    cursor: "pointer"
  });
  $("#entrepaso").prop("disabled", true);
  $("#entrepaso").css({
    "background-color": "gray",
    color: "white",
    "text-align": "center",
    "text-decoration": "none",
    display: "inline-block",
    cursor: "pointer"
  });
  $("#entreauto").prop("disabled", true);
  $("#entreauto").css({
    "background-color": "gray",
    color: "white",
    "text-align": "center",
    "text-decoration": "none",
    display: "inline-block",
    cursor: "pointer"
  });
  $("#load").prop("disabled", true);
  $("#load").css({
    "background-color": "gray",
    color: "white",
    "text-align": "center",
    "text-decoration": "none",
    display: "inline-block",
    cursor: "pointer"
  });
  $("#geconeval").prop("disabled", true);
  $("#geconeval").css({
    "background-color": "gray",
    color: "white",
    "text-align": "center",
    "text-decoration": "none",
    display: "inline-block",
    cursor: "pointer"
  });
  $("#evaluate").prop("disabled", true);
  $("#evaluate").css({
    "background-color": "gray",
    color: "white",
    "text-align": "center",
    "text-decoration": "none",
    display: "inline-block",
    cursor: "pointer"
  });
  $("#iniciarup").prop("disabled", true);
  $("#iniciarup").css({
    "background-color": "gray",
    color: "white",
    "text-align": "center",
    "text-decoration": "none",
    display: "inline-block",
    cursor: "pointer"
  });
  //Agregar eventos del teclado
  document.addEventListener(
    "keydown",
    event => {
      const keyName = event.key;

      if (keyName === "p" || keyName === "P") {
        uPObject.pasoAPaso();
      }
    },
    false
  );

  //Inicializar objetos
  generadorObject = new Generador();
  uPObject = new uP(1);

  var chartEntrenamiento = Highcharts.chart("gEntrenamiento", {
    chart: {
      type: "scatter"
    },
    title: {
      text: "Actividad Del Perceptron"
    },
    subtitle: {
      text: "Graficas de procesos que ocurren en la neurona"
    },
    xAxis: {
      title: {
        text: "Eje X"
      }
    },
    yAxis: {
      title: {
        text: "Eje Y"
      }
    },
    series: [
      {
        name: "Puntos",
        color: colorPuntosSinClasificar
        // data: [[1.6, 4]]
      },
      {
        type: "line",
        name: "Ec. Recta",
        color: colorPuntosRecta,
        lineWidth: 0.5
        // data:
        // [[0,1],[1,1.5],[2,2],[3,2.5],[4,3],[5,3.5],[6,4],[7,4.5],[8,5],[9,5.5],[10,6]]
      }
    ]
  });

  // Grafica del problema
  var chartProblema = Highcharts.chart("gProblema", {
    chart: {
      type: "scatter"
    },
    title: {
      text: "Problema Generado"
    },
    subtitle: {
      text: "Puntos creados al azar"
    },
    xAxis: {
      title: {
        text: "Eje X"
      }
    },
    yAxis: {
      title: {
        text: "Eje Y"
      }
    },
    series: [
      {
        name: "Puntos sobre la recta",
        color: colorPuntosUp,
        data: [[2, 7]]
      },
      {
        name: "Puntos bajo la recta",
        color: colorPuntosDown,
        data: [[8, 1]]
      },
      {
        type: "line",
        name: "Ec. Recta y=mx+b con m=" + mProblema + " y b=" + bProblema,
        color: colorPuntosRecta,
        lineWidth: 0.5,
        data: [
          [0, 1],
          [1, 1.5],
          [2, 2],
          [3, 2.5],
          [4, 3],
          [5, 3.5],
          [6, 4],
          [7, 4.5],
          [8, 5],
          [9, 5.5],
          [10, 6]
        ]
      }
    ]
  });
});
