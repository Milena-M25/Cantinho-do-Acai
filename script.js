
const tamanhos = document.querySelectorAll('input[name="tamanho"]');
const adicionais = document.querySelectorAll('.adicional');

const nome = document.getElementById('nome');
const telefone = document.getElementById('telefone');
const rua = document.getElementById('rua');
const numeroCasa = document.getElementById('numero-casa');
const bairro = document.getElementById('bairro');
const complemento = document.getElementById('complemento');
const observacao = document.getElementById('observacao');

const contador = document.getElementById('contador-adicionais');
const avisoLimite = document.getElementById('aviso-limite');
const mensagem = document.getElementById('mensagem');

const precoBase = document.getElementById('preco-base');
const precoAdicionais = document.getElementById('preco-adicionais');
const precoEntrega = document.getElementById('preco-entrega');
const valorTotal = document.getElementById('valor-total');

const resumoTamanho = document.getElementById('medidor-tamanho');
const listaAdicionais = document.getElementById('lista-adicionais');
const liquido = document.getElementById('liquido');
const decoracaoCopo = document.getElementById('decoracao-copo');
const barraPreenchimento = document.getElementById('barra-preenchimento');
const textoPreenchimento = document.getElementById('texto-preenchimento');

const botaoConfirmar = document.getElementById('confirmar-pedido');

const simbolos = {
    'Leite em pó': '🥛',
    'Banana': '🍌',
    'Granola': '🌾',
    'Leite condensado': '🥛',
    'Morango': '🍓',
    'Confete': '🍬'
};

function dinheiro(valor) {
    return Number(valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function tamanhoSelecionado() {
    return document.querySelector('input[name="tamanho"]:checked');
}

function adicionaisSelecionados() {
    return Array.from(adicionais).filter(function(item) {
        return item.checked;
    });
}

function limiteAdicionais(tamanho) {
    if (tamanho === '300 ml') return 2;
    if (tamanho === '500 ml') return 4;

    return Infinity;
}

// Calcula a taxa de entrega pelo bairro.
function calcularEntrega() {
    const nomeBairro = bairro.value.trim();

    if (nomeBairro.toLocaleLowerCase('pt-BR') === 'centro') {
        return 5;
    }

    return 10;
}

function mostrarAviso(texto, erro = false) {
    avisoLimite.textContent = texto;

    if (erro) {
        avisoLimite.style.background = '#fff0f0';
        avisoLimite.style.borderColor = '#f2c5c5';
        avisoLimite.style.color = '#b43d4b';
    } else {
        avisoLimite.style.background = '#eafaf7';
        avisoLimite.style.borderColor = '#c8eee8';
        avisoLimite.style.color = '#247e77';
    }
}

function atualizarCopo(tamanho, quantidade, itens) {
    let nivel = 43;

    if (tamanho === '500 ml') nivel = 60;
    if (tamanho === '700 ml') nivel = 76;

    nivel = Math.min(nivel + quantidade * 4, 94);

    liquido.style.height = nivel + '%';
    barraPreenchimento.style.width = nivel + '%';
    resumoTamanho.textContent = tamanho;

    if (quantidade === 0) {
        textoPreenchimento.textContent =
            'Seu açaí está esperando seus adicionais!';
    } else {
        textoPreenchimento.textContent =
            'Seu açaí está ficando delicioso!';
    }

    decoracaoCopo.innerHTML = '';

    itens.forEach(function(item) {
        const simbolo = document.createElement('span');

        simbolo.textContent = simbolos[item.dataset.nome] || '✨';
        simbolo.title = item.dataset.nome;

        decoracaoCopo.appendChild(simbolo);
    });
}

// Atualiza preços, lista, taxa e simulação.
function atualizarPedido() {
    const tamanho = tamanhoSelecionado();

    if (!tamanho) return;

    const itens = adicionaisSelecionados();
    const precoTamanho = Number(tamanho.value);

    let somaAdicionais = 0;

    itens.forEach(function(item) {
        somaAdicionais += Number(item.value);
    });

    const entrega = calcularEntrega();
    const total = precoTamanho + somaAdicionais + entrega;

    contador.textContent = itens.length;

    precoBase.textContent = dinheiro(precoTamanho);
    precoAdicionais.textContent = dinheiro(somaAdicionais);
    precoEntrega.textContent = dinheiro(entrega);
    valorTotal.textContent = dinheiro(total);

    listaAdicionais.innerHTML = '';

    if (itens.length === 0) {
        const linha = document.createElement('li');
        linha.textContent = 'Nenhum adicional selecionado';
        listaAdicionais.appendChild(linha);
    } else {
        itens.forEach(function(item) {
            const linha = document.createElement('li');
            const nomeItem = document.createElement('span');
            const precoItem = document.createElement('strong');

            nomeItem.textContent = item.dataset.nome;
            precoItem.textContent = dinheiro(Number(item.value));

            linha.appendChild(nomeItem);
            linha.appendChild(precoItem);
            listaAdicionais.appendChild(linha);
        });
    }

    atualizarCopo(tamanho.dataset.nome, itens.length, itens);
}

// Limita a seleção de adicionais.
adicionais.forEach(function(item) {
    item.addEventListener('change', function() {
        const tamanho = tamanhoSelecionado().dataset.nome;
        const limite = limiteAdicionais(tamanho);
        const itens = adicionaisSelecionados();

        if (item.checked && itens.length > limite) {
            item.checked = false;

            mostrarAviso(
                'Limite atingido! O copo de ' + tamanho +
                ' aceita no máximo ' + limite + ' adicionais.',
                true
            );
        } else {
            mostrarAviso(
                limite === Infinity
                    ? 'O copo de 700 ml não tem limite de adicionais.'
                    : 'O copo de ' + tamanho + ' aceita até ' +
                      limite + ' adicionais.'
            );
        }

        atualizarPedido();
    });
});

// Se o tamanho mudar, remove os adicionais excedentes.
tamanhos.forEach(function(item) {
    item.addEventListener('change', function() {
        const tamanho = item.dataset.nome;
        const limite = limiteAdicionais(tamanho);
        const itens = adicionaisSelecionados();

        let removidos = 0;

        while (itens.length > limite) {
            itens.pop().checked = false;
            removidos++;
        }

        if (removidos > 0) {
            mostrarAviso(
                'Você mudou para ' + tamanho + '. ' +
                removidos + ' adicional(is) foram removidos.',
                true
            );
        } else {
            mostrarAviso(
                limite === Infinity
                    ? 'O copo de 700 ml não tem limite de adicionais.'
                    : 'O copo de ' + tamanho + ' aceita até ' +
                      limite + ' adicionais.'
            );
        }

        atualizarPedido();
    });
});

// Atualiza a taxa quando o bairro é alterado.
bairro.addEventListener('input', atualizarPedido);

// Formata o telefone enquanto o cliente digita.
telefone.addEventListener('input', function() {
    let numeros = telefone.value.replace(/\D/g, '');

    if (numeros.length > 11) {
        numeros = numeros.slice(0, 11);
    }

    if (numeros.length > 10) {
        telefone.value = numeros.replace(
            /^(\d{2})(\d{5})(\d{4})$/,
            '($1) $2-$3'
        );
    } else if (numeros.length > 6) {
        telefone.value = numeros.replace(
            /^(\d{2})(\d{4})(\d{0,4})$/,
            function(_, ddd, parte1, parte2) {
                return '(' + ddd + ') ' + parte1 +
                    (parte2 ? '-' + parte2 : '');
            }
        );
    } else if (numeros.length > 2) {
        telefone.value = '(' + numeros.slice(0, 2) + ') ' +
            numeros.slice(2);
    } else if (numeros.length > 0) {
        telefone.value = '(' + numeros;
    }
});

// Valida os campos antes de confirmar.
function validarPedido() {
    const campos = [
        { campo: nome, descricao: 'Digite seu nome completo.' },
        { campo: telefone, descricao: 'Informe seu telefone com DDD.' },
        { campo: rua, descricao: 'Informe a rua ou avenida.' },
        { campo: numeroCasa, descricao: 'Informe o número do endereço.' },
        { campo: bairro, descricao: 'Informe seu bairro.' }
    ];

    for (const item of campos) {
        if (!item.campo.value.trim()) {
            mostrarErro(item.descricao);
            item.campo.focus();
            return false;
        }
    }

    const numeros = telefone.value.replace(/\D/g, '');

    if (numeros.length !== 10 && numeros.length !== 11) {
        mostrarErro(
            'Telefone inválido! Digite o DDD e um número com 8 ou 9 dígitos.'
        );

        telefone.focus();
        return false;
    }

    if (/^(\d)\1+$/.test(numeros)) {
        mostrarErro('Confira o telefone informado.');
        telefone.focus();
        return false;
    }

    const tamanho = tamanhoSelecionado();
    const itens = adicionaisSelecionados();

    if (itens.length > limiteAdicionais(tamanho.dataset.nome)) {
        mostrarErro('A quantidade de adicionais ultrapassou o limite.');
        return false;
    }

    return true;
}

function mostrarErro(texto) {
    mensagem.textContent = '⚠️ ' + texto;
    mensagem.classList.add('erro');
}

// Confirma o pedido somente se os dados forem válidos.
botaoConfirmar.addEventListener('click', function() {
    mensagem.textContent = '';
    mensagem.classList.remove('erro');

    if (!validarPedido()) {
        return;
    }

    const tamanho = tamanhoSelecionado();
    const itens = adicionaisSelecionados();

    const pedido = {
        nome: nome.value.trim(),
        telefone: telefone.value.trim(),
        endereco: {
            rua: rua.value.trim(),
            numero: numeroCasa.value.trim(),
            bairro: bairro.value.trim(),
            complemento: complemento.value.trim(),
            observacao: observacao.value.trim()
        },
        tamanho: tamanho.dataset.nome,
        adicionais: itens.map(function(item) {
            return {
                nome: item.dataset.nome,
                preco: Number(item.value)
            };
        }),
        subtotalAcaí: Number(tamanho.value) +
            itens.reduce(function(soma, item) {
                return soma + Number(item.value);
            }, 0),
        taxaEntrega: calcularEntrega(),
        total: Number(tamanho.value) +
            itens.reduce(function(soma, item) {
                return soma + Number(item.value);
            }, 0) + calcularEntrega()
    };

    const resumo = [
        'PEDIDO - CANTINHO DO AÇAÍ',
        '',
        'Cliente: ' + pedido.nome,
        'Telefone: ' + pedido.telefone,
        'Endereço: ' + pedido.endereco.rua + ', ' +
            pedido.endereco.numero,
        'Bairro: ' + pedido.endereco.bairro,
        pedido.endereco.complemento
            ? 'Complemento: ' + pedido.endereco.complemento
            : '',
        pedido.endereco.observacao
            ? 'Referência: ' + pedido.endereco.observacao
            : '',
        '',
        'Tamanho: ' + pedido.tamanho,
        'Adicionais: ' +
            (pedido.adicionais.length
                ? pedido.adicionais.map(function(item) {
                    return item.nome;
                }).join(', ')
                : 'Nenhum'),
        'Açaí e adicionais: ' + dinheiro(pedido.subtotalAcaí),
        'Entrega: ' + dinheiro(pedido.taxaEntrega),
        'TOTAL: ' + dinheiro(pedido.total)
    ].filter(Boolean).join('\n');

    mensagem.classList.remove('erro');
    mensagem.textContent =
        'Pedido conferido! Confira os dados na janela de confirmação.';

    alert(resumo);
});

// Inicia os valores do pedido.
atualizarPedido();
