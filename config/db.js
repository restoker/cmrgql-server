import {connect} from 'mongoose';

const conectarDB = async _ => {
    try {
        connect(process.env.MONGO_URI, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });
        console.log('conectado a Mongo Atlas'.blue);
    } catch (e) {
        console.log(e);
        process.exit(1);//detener la aplicacion
    }
}

export default conectarDB;