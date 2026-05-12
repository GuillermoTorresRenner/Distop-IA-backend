# README Integración AVM

## 1. Variables de Entorno

Definir las siguientes variables en el archivo `.env`:

```env
QUEUE_AVM=avm_requests
RABBITMQ_HOST=rabbitmq
```

---

## 2. Estructura Docker Compose

Ejemplo base con volúmenes y servicios:

```yaml
services:
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    container_name: rabbitmq
    restart: unless-stopped
    networks:
      - avm_network

  avm:
    image: lanek/avm-microservice-rabbitmq:latest
    container_name: avm-microservice-rabbitmq
    depends_on:
      - rabbitmq

    env_file:
      - .env

    environment:
      - QUEUE_AVM=${QUEUE_AVM}
      - RABBITMQ_HOST=${RABBITMQ_HOST}
      - PYTHONUNBUFFERED=1
    
    volumes:
      - ./resources:/public/files/examenes

    restart: unless-stopped

    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 4G

    networks:
      - avm_network

networks:
  avm_network:
    driver: bridge
```

---

## 3. Comunicación con RabbitMQ

### 3.1 Contenedor de cola externo
- Servicio `rabbitmq` definido en `docker-compose`
- Accesible mediante hostname: `rabbitmq`

### 3.2 Configuración por `.env`
- `QUEUE_AVM`: nombre de la cola
- `RABBITMQ_HOST`: host del broker

### 3.3 Request (Formato)

Archivo `request.json`:

```json
{
    "info_examen": {
        "type": "avm",
        "id": "666"
    },
    "localFiles": {
        "folder": "/resources/test"
    },
    "processing_parameters": {
        "SPLThreshold": 55,
        "pitchMethod": "autoCorr",
        "channelSelect": 0,
        "features": [
            "SPECTROGRAM",
            "H1H2",
            "HRF",
            "JITTER",
            "SHIMMER",
            "CPP"
        ]
    }
}
```

---

### 3.4 Response

```python
result = {"status": "done", "message": "processed"}
result = {"status": "error", "message": str(e)}
result = {"status": "invalid", "message": response.errors()}
```

---

## 4. Persistencia en Base de Datos

Estructura sugerida:

| ID | TIPO | FOLDER | STATUS | REQUEST | SPL | F0 | SPECTROGRAM | H1H2 | HRF | JITTER | SHIMMER | CPP |
|----|------|--------|--------|---------|-----|----|--------------|------|-----|--------|---------|-----|

---

## 5. Interfaces (TypeScript)

```ts
export interface Test {
    request: Request;
    results: Results;
}

export interface Request {
    info_examen:           InfoExamen;
    localFiles:            LocalFiles;
    processing_parameters: ProcessingParameters;
}

export interface InfoExamen {
    type: string;
    id:   string;
}

export interface LocalFiles {
    folder: string;
    format: null;
    files:  null;
}

export interface ProcessingParameters {
    SPLThreshold:  number;
    pitchMethod:   string;
    channelSelect: number;
    features:      string[];
}

export interface Results {
    SPL:         Cpp;
    F0:          Cpp;
    SPECTROGRAM: Spectrogram;
    Voices:      Voices;
    H1H2:        Cpp;
    HRF:         Cpp;
    JITTER:      Cpp;
    SHIMMER:     Cpp;
    CPP:         Cpp;
}

export interface Cpp {
    xaxis:       string;
    xunit:       string;
    yaxis:       string;
    yunit:       string;
    data:        Array<number | null>;
    title:       string;
    descripcion: string;
    stats:       { [key: string]: number };
}

export interface Spectrogram {
    xaxis:       string;
    xunit:       string;
    yaxis:       string;
    yunit:       string;
    data:        number[];
    title:       string;
    descripcion: string;
    stats:       { [key: string]: number };
}

export interface Voices {
    onlyVoices: number;
    length:     number;
    allVoices:  number[];
}
```
