const express = require('express');  // Importa o Express, um framework para criar servidores HTTP.
const app = express();  // Cria uma instância do aplicativo Express.
const porta = 5000;  // Define a porta do servidor.
const bodyParser = require('body-parser');  // Importa o body-parser, um middleware para interpretar dados enviados via POST.
const Nota = require('./models/nota');  // Importa o modelo Nota (provavelmente para acessar o banco de dados).

//#region Middleware
app.use(express.json());  // Middleware para receber dados no formato JSON, útil para APIs.
app.use(bodyParser.urlencoded({ extended: true }));  // Middleware para processar dados de formulários URL-encoded.

// Middleware para contar o número de notas e aplicar regras de negócio (limitação e horário)
app.use(async (req, res, next) => {
    try {
        // Conta o número de notas no banco de dados
        const quant_notas = await Nota.count();

        // Obtém todas as notas do banco de dados
        const notas = await Nota.findAll();

        // Adiciona as informações sobre as notas no objeto res.locals para uso nas rotas
        res.locals.quant_notas = quant_notas;
        res.locals.notas = notas;

        // Aplica a regra de Limitação de Notas: só pode adicionar até 5 notas
        if (quant_notas >= 5) {
            res.locals.cannotAddNotes = true;  // Limita a adição de notas se já houver 5 ou mais
        } else {
            res.locals.cannotAddNotes = false;  // Permite adicionar mais notas se menos de 5 existirem
        }

        // Aplica a regra de horário: acesso permitido entre 9h e 18h
        const currentHour = new Date().getHours();  // Obtém a hora atual do sistema
        if (currentHour >= 16 && currentHour < 18) {  // Permite o acesso somente entre as 16h e 18h
            res.locals.isAllowedTime = true;
        } else {
            res.locals.isAllowedTime = false;
            return res.status(403).send('Acesso não permitido fora do horário de funcionamento (9h - 18h)'); // Retorna erro diretamente
        }

        next();  // Passa para o próximo middleware ou rota.
    } catch (error) {
        // Caso ocorra algum erro ao contar as notas ou aplicar as regras, ele será capturado aqui.
        console.error('Erro ao contar as notas:', error);
        res.status(500).send('Erro ao contar as notas');  // Responde com erro 500 (erro interno do servidor)
    }
});
//#endregion

//#region Configurações da Aplicação
app.set('view engine', 'ejs');  // Define o EJS como engine de visualização para renderizar os templates HTML.
app.set('views', __dirname + '/views');  // Define o diretório onde os arquivos EJS (templates) estão localizados.
//#endregion

//#region Rotas

// Rota principal: Exibe todas as notas
app.get('/', (req, res) => {
    try {
        const quant_notas = res.locals.quant_notas;  // Obtém a quantidade de notas
        const cannotAddNotes = res.locals.cannotAddNotes;  // Verifica se é possível adicionar notas
        const isAllowedTime = res.locals.isAllowedTime;  // Verifica se o acesso é permitido pelo horário
        res.render('index', { quant_notas, cannotAddNotes, isAllowedTime });  // Renderiza a página inicial com os dados
    } catch (error) {
        // Caso ocorra um erro ao carregar as notas
        console.error(error);
        res.status(500).send('Erro ao carregar as notas');
    }
});

// Rota para mostrar o formulário de adicionar nova nota
app.get('/adicionar_nota', (req, res) => {
    const isAllowedTime = res.locals.isAllowedTime;  // Verifica se o acesso está dentro do horário permitido
    const cannotAddNotes = res.locals.cannotAddNotes;  // Verifica se a limitação de notas impede adicionar mais

    if (!isAllowedTime) {
        return res.status(403).send('Acesso não permitido fora do horário de funcionamento (9h - 18h)');
    }

    if (cannotAddNotes) {
        return res.status(403).send('Não é possível adicionar mais de 5 notas');
    }

    res.render('adicionar_nota');  // Renderiza o formulário de adicionar uma nova nota
});

// Rota para processar o envio do formulário de adicionar nota
app.post('/adicionar_nota', async (req, res) => {
    const { titulo, conteudo } = req.body;  // Extrai os dados do formulário (titulo e conteudo da nota)

    // Loga os dados recebidos para facilitar o debugging
    console.log(`Titulo: ${titulo}, Conteudo: ${conteudo}`);
    console.log(req.body);

    try {
        // Cria uma nova nota no banco de dados
        await Nota.create({ titulo, conteudo });
        res.redirect('/');  // Redireciona para a página principal após a adição da nota
    } catch (error) {
        // Caso ocorra um erro ao salvar a nota no banco de dados
        console.error(error);
        res.status(500).send('Erro ao adicionar nota');
    }
});

// Rota para apagar todas as notas
app.get('/apagar_notas', async (req, res) => {
    try {
        // Apaga todas as notas no banco de dados
        await Nota.destroy({ where: {}, truncate: true });
        console.log("Todas as notas foram apagadas.");
        res.redirect('/');  // Redireciona para a página principal após apagar as notas
    } catch (error) {
        // Caso ocorra um erro ao apagar as notas
        console.error(error);
        res.status(500).send('Erro ao apagar as notas');
    }
});

// Rota para ler todas as notas
app.get('/ler', async (req, res) => {
    try {
        // Obtém todas as notas armazenadas no banco de dados
        const notas = res.locals.notas;  // As notas já foram carregadas no middleware e estão em res.locals

        // Renderiza a página para exibir as notas
        res.render('ler_notas', { notas });
    } catch (error) {
        // Caso ocorra um erro ao carregar as notas
        console.error(error);
        res.status(500).send('Erro ao carregar as notas');
    }
});

//#endregion

// Inicia o servidor na porta definida
app.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}`);  // Exibe mensagem no console indicando que o servidor está ativo
});
