import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [vuelos, setVuelos] = useState([]);
  const [detallesVisibles, setDetallesVisibles] = useState({});
  const [asientosOcupados, setAsientosOcupados] = useState({});
  const [idVuelo, setIdVuelo] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [plazas, setPlazas] = useState("");
  const [mensajeCabecera, setMensajeCabecera] = useState("");

  useEffect(() => {
    const fetchVuelos = async () => {
      const response = await fetch("./vuelos.json");
      const data = await response.json();
      setVuelos(data);

      // Inicializar el estado de asientos ocupados
      const initialSeats = {};
      data.forEach((vuelo) =>
        vuelo.flights.forEach((flight) => {
          initialSeats[flight.number] = 0; // Inicializar con 0 asientos ocupados
        })
      );
      setAsientosOcupados(initialSeats);
    };
    fetchVuelos();
  }, []);

  // Función para alternar la visibilidad de los detalles de un vuelo
  const toggleDetalles = (flightNumber) => {
    setDetallesVisibles((prevState) => ({
      ...prevState,
      [flightNumber]: !prevState[flightNumber],
    }));
  };

  // Función para reservar una plaza en un vuelo específico
  const reservarPlaza = (flightNumber, maxSeats) => {
    setAsientosOcupados((prevState) => {
      const newState = { ...prevState };
      if (newState[flightNumber] < maxSeats) {
        newState[flightNumber] += 1; // Incrementar asientos ocupados
      }
      return newState;
    });
  };

  // Función para liberar una plaza en un vuelo específico
  const liberarPlaza = (flightNumber) => {
    setAsientosOcupados((prevState) => {
      const newState = { ...prevState };
      if (newState[flightNumber] > 0) {
        newState[flightNumber] -= 1; // Decrementar asientos ocupados
      }
      return newState;
    });
  };

  // Función para añadir un nuevo vuelo
  const añadirVuelo = () => {
    if (!idVuelo || !fecha || !hora || !plazas) {
      alert("Por favor, completa todos los campos antes de añadir un vuelo.");
      return;
    }

    // Verificar si el vuelo ya existe
    let vueloExistente = false;
    vuelos.forEach((destino) =>
      destino.flights.forEach((vuelo) => {
        if (vuelo.number === idVuelo) {
          vueloExistente = true;
        }
      })
    );
    if (vueloExistente) {
      alert("El vuelo ya existe.");
      return;
    }

    // Añadir vuelo
    const nuevoVuelo = {
      date: fecha,
      time: hora,
      number: idVuelo,
      seats: parseInt(plazas),
    };

    const nuevoDestino = vuelos.map((destino) => {
      if (destino.destination === "Sevilla") {
        destino.flights.push(nuevoVuelo);
      }
      return destino;
    });

    setVuelos(nuevoDestino);
    setIdVuelo("");
    setFecha("");
    setHora("");
    setPlazas("");
  };

  // Función para eliminar un vuelo
  const eliminarVuelo = (vueloNumber) => {
    const nuevoDestino = vuelos.map((destino) => {
      destino.flights = destino.flights.filter(
        (vuelo) => vuelo.number !== vueloNumber
      );
      return destino;
    });

    setVuelos(nuevoDestino);
  };

  // Mostrar mensaje cuando las plazas sean menos de 3
  useEffect(() => {
    vuelos.forEach((destino) => {
      destino.flights.forEach((vuelo) => {
        const maxSeats = vuelo.seats;
        const reservedSeats = asientosOcupados[vuelo.number] || 0;
        const availableSeats = maxSeats - reservedSeats;

        if (availableSeats < 3) {
          setMensajeCabecera(
            `Últimas plazas disponibles para el vuelo ${vuelo.number} con destino ${destino.destination}`
          );
        }
      });
    });
  }, [asientosOcupados, vuelos]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>{mensajeCabecera}</h1>
        {vuelos.map((vueloDestino) => (
          <div key={vueloDestino.destination}>
            <h2>{vueloDestino.destination}</h2>
            {vueloDestino.flights.map((vuelo) => {
              const vueloNumber = vuelo.number;
              const maxSeats = vuelo.seats;
              const reservedSeats = asientosOcupados[vueloNumber] || 0;
              const availableSeats = maxSeats - reservedSeats;
              return (
                <div key={vueloNumber}>
                  <p>Fecha: {vuelo.date}</p>
                  <p>Número de vuelo: {vueloNumber}</p>
                  <button onClick={() => toggleDetalles(vueloNumber)}>
                    {detallesVisibles[vueloNumber]
                      ? "Ocultar Detalles"
                      : "Mostrar Detalles"}
                  </button>
                  {detallesVisibles[vueloNumber] && (
                    <div>
                      <p>Hora: {vuelo.time}</p>
                      <p>Plazas disponibles: {availableSeats}</p>
                      <p>Plazas ocupadas: {reservedSeats}</p>

                      <button
                        onClick={() => reservarPlaza(vueloNumber, maxSeats)}
                        disabled={availableSeats === 0}
                      >
                        Reservar plaza
                      </button>
                      <button
                        onClick={() => liberarPlaza(vueloNumber)}
                        disabled={reservedSeats === 0}
                      >
                        Liberar plaza
                      </button>
                      <button onClick={() => eliminarVuelo(vueloNumber)}>
                        Eliminar vuelo
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            <div>
              <h3>Añadir vuelo</h3>
              <input
                type="text"
                value={idVuelo}
                onChange={(e) => setIdVuelo(e.target.value)}
                placeholder="ID de vuelo"
              />
              <input
                type="text"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                placeholder="Fecha"
              />
              <input
                type="text"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                placeholder="Hora"
              />
              <input
                type="text"
                value={plazas}
                onChange={(e) => setPlazas(e.target.value)}
                placeholder="Plazas disponibles"
              />
              <button onClick={añadirVuelo}>Añadir vuelo</button>
            </div>
          </div>
        ))}
      </header>
    </div>
  );
}

export default App;