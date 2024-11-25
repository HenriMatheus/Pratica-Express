// Importando o Sequelize e DataTypes do pacote 'sequelize'
const { Sequelize, DataTypes } = require('sequelize');

// Criação da instância do Sequelize
// O Sequelize é um ORM (Object-Relational Mapper) para Node.js, que facilita a comunicação com o banco de dados.
// Aqui, criamos uma nova instância do Sequelize, configurada para usar o banco de dados SQLite,
// com o arquivo 'database.sqlite' para armazenar os dados.
const sequelize = new Sequelize({
  dialect: 'sqlite', // Define que o banco de dados será do tipo 'sqlite'
  storage: './database.sqlite' // Define o caminho para o arquivo SQLite onde os dados serão armazenados
});

// Definição do modelo 'Nota' utilizando o Sequelize
// O modelo 'Nota' representa a estrutura das notas que serão armazenadas no banco de dados.
const Nota = sequelize.define('Nota', {
  // Definindo o campo 'titulo' da nota
  titulo: {
    type: DataTypes.STRING, // O campo 'titulo' será uma string (texto curto)
    allowNull: false // O título não pode ser nulo, ou seja, é obrigatório
  },
  
  // Definindo o campo 'conteudo' da nota
  conteudo: {
    type: DataTypes.TEXT, // O campo 'conteudo' será um texto (pode ser mais longo)
    allowNull: false // O conteúdo não pode ser nulo, ou seja, é obrigatório
  }
});

// Sincronização do banco de dados com a definição do modelo
// O comando 'sequelize.sync()' cria a tabela 'Notas' no banco de dados, caso ela ainda não exista.
// Isso garante que a estrutura do banco de dados esteja atualizada conforme a definição do modelo 'Nota'.
sequelize.sync()
  .then(() => console.log('Banco de dados sincronizado')) // Caso a sincronização seja bem-sucedida, exibe uma mensagem no console
  .catch((err) => console.log('Erro ao sincronizar o banco de dados', err)); // Caso ocorra algum erro na sincronização, exibe uma mensagem de erro no console

// Exportando o modelo 'Nota' para que ele possa ser utilizado em outras partes da aplicação
module.exports = Nota;  // Apenas o modelo 'Nota' é exportado, para que possa ser utilizado em outros módulos
