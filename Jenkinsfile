// Pipeline del frontend NuevoIngresoWeb.
// Agente Windows (bat); coherente con el entorno de desarrollo del equipo.
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        IMAGE_NAME = 'nuevoingresoweb-frontend'
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
        // Nombre del job del backend que dispara este pipeline (ver FASE 8
        // de la documentación). Déjalo vacío si todavía no existe ese job:
        // el bloque "triggers" de abajo no falla si el proyecto no existe,
        // simplemente nunca se dispara.
        UPSTREAM_BACKEND_JOB = 'IngresoUniversitarioTPI135-backend'
        // Defaults para el contenedor de demo (stage "Deploy (demo)"). En
        // cmd.exe una variable no definida se expande literalmente como
        // "%BACKEND_HOST%" en vez de vacío, por eso deben tener un valor
        // aquí siempre. host.docker.internal es el nombre que Docker Desktop
        // en Windows resuelve automáticamente hacia el host (donde corre el
        // backend en el puerto 9080), sin requerir --add-host ni red Docker
        // compartida entre frontend y backend.
        BACKEND_HOST = 'host.docker.internal'
        BACKEND_PORT = '9080'
    }

    // Disparo por cambios del backend (pull-based). Alternativa equivalente
    // (push-based, recomendada): en el Jenkinsfile del backend, agregar al
    // final del pipeline:
    //   build job: 'NuevoIngresoWeb-Frontend', wait: false
    triggers {
        upstream(upstreamProjects: "${UPSTREAM_BACKEND_JOB}", threshold: hudson.model.Result.SUCCESS)
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Test') {
            steps {
                bat 'npm run test:junit'
            }
            post {
                always {
                    junit 'test-results/junit.xml'
                }
            }
        }

        stage('Coverage') {
            steps {
                bat 'npm run coverage'
            }
        }

        stage('SonarQube') {
            steps {
                // Requiere el plugin SonarQube Scanner configurado en Jenkins
                // con un servidor llamado "SonarQubeServer" (ajustar al real).
                withSonarQubeEnv('SonarQubeServer') {
                    bat 'sonar-scanner'
                }
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Archive Artifact') {
            steps {
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }

        stage('Docker Build') {
            steps {
                bat "docker build -t %IMAGE_NAME%:%IMAGE_TAG% -t %IMAGE_NAME%:latest ."
            }
        }

        // Despliegue continuo a nivel demostrativo: recrea el contenedor local.
        // Para un entorno real, reemplazar por push a un registry + deploy remoto.
        stage('Deploy (demo)') {
            steps {
                bat """
                    docker rm -f %IMAGE_NAME% || exit 0
                    docker run -d --name %IMAGE_NAME% -p 8080:80 ^
                        -e BACKEND_HOST=%BACKEND_HOST% ^
                        -e BACKEND_PORT=%BACKEND_PORT% ^
                        %IMAGE_NAME%:latest
                """
            }
        }
    }
}
