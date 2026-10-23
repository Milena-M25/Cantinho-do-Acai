
const $ = (seletor) => document.querySelector(seletor);
const $$ = (seletor) => [...document.querySelectorAll(seletor)];

const precosCopos = {
  300: 12,
  500: 16,
  700: 20
};

const bairro = $("#bairro");
const rua = $("#rua");
const listaRuas = $("#lista-ruas");
const telefone = $("#telefone");
const formulario = $("#form-pedido");
const avisoAdicionais = $("#aviso-adicionais");

const adicionais = $$('input[name="adicional"]');
const tamanhos = $$('input[name="tamanho"]');

const dinheiro = (valor) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

function obterTamanho() {
  return Number($('input[name="tamanho"]:checked').value);
}

function obterLimite(tamanho) {
  if (tamanho === 300) return 2;
  if (tamanho === 500) return 4;

  // O copo de 700 ml não tem limite configurado nesta versão.
  return Infinity;
}

function obterAdicionaisSelecionados() {
  return adicionais.filter((item) => item.checked);
}

function calcularAdicionais() {
  return obterAdicionaisSelecionados().reduce((total, item) => {
    return total + Number(item.dataset.preco);
  }, 0);
}

function calcularEntrega() {
  const nomeBairro = bairro.value.trim().toLocaleLowerCase("pt-BR");

  if (!nomeBairro) return 10;

  if (nomeBairro === "centro") return 5;

  return 10;
}

function atualizarAvisoAdicionais() {
  const tamanho = obterTamanho();
  const limite = obterLimite(tamanho);
  const selecionados = obterAdicionaisSelecionados();

  if (selecionados.length > limite) {
    const ultimo = selecionados[selecionados.length - 1];
    ultimo.checked = false;
  }

  const quantidade = obterAdicionaisSelecionados().length;

  if (limite === Infinity) {
    avisoAdicionais.textContent =
      `Você selecionou ${quantidade} adicional(is) para o copo de 700 ml.`;
  } else {
    avisoAdicionais.textContent =
      `Você selecionou ${quantidade} de ${limite} adicionais disponíveis.`;

    if (quantidade === limite) {
      avisoAdicionais.textContent += " Limite atingido!";
    }
  }

  avisoAdicionais.classList.remove("erro");
}

function atualizarPedido() {
  const tamanho = obterTamanho();
  const precoCopo = precosCopos[tamanho];
  const precoAdicionais = calcularAdicionais();
  const precoEntrega = calcularEntrega();
  const total = precoCopo + precoAdicionais + precoEntrega;

  $("#preco-copo").textContent = dinheiro(precoCopo);
  $("#preco-adicionais").textContent = dinheiro(precoAdicionais);
  $("#preco-entrega").textContent = dinheiro(precoEntrega);
  $("#valor-total").textContent = dinheiro(total);
  $("#total-final").textContent = dinheiro(total);

  atualizarAvisoAdicionais();

  const quantidade = obterAdicionaisSelecionados().length;
  const recheio = $("#recheio-copo");

  // O copo enche visualmente conforme a quantidade escolhida.
  const preenchimento = Math.min(25 + quantidade * 15, 95);
  recheio.style.height = `${preenchimento}%`;

  if (quantidade === 0) {
    $("#texto-copo").textContent =
      "Seu açaí está esperando os adicionais!";
  } else {
    $("#texto-copo").textContent =
      `Seu açaí está com ${quantidade} adicional(is). Que delícia!`;
  }
}

// Lista inicial de exemplos de ruas por bairro.
// Acrescente mais ruas conforme obtiver uma base confiável.
const ruasPorBairro = {
  "centro": [
    "Avenida Almirante Pedro Álvares Cabral",
    "Rua Benedito Soares Pinto",
    "Rua Centenário",
    "Rua Xavier da Silva",
    "Rua Marechal Deodoro"
  ],

  "bom jesus": [
    "Avenida Ademar de Barros",
    "Avenida Antônio Munari",
    "Avenida Bom Jesus"
  ],

  "jardim keli cristina": [
    "Alameda Oscar Muxfeldt"
  ],

  "vila gilcy": [
    "Avenida Arapongas"
  ]
};

function normalizar(texto) {
  return texto
    .trim()
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function atualizarSugestoesRuas() {
  const bairroEscolhido = normalizar(bairro.value);

  listaRuas.innerHTML = "";

  const chave = Object.keys(ruasPorBairro).find((nome) => {
    return normalizar(nome) === bairroEscolhido;
  });

  if (!chave) {
    rua.placeholder = "Digite a rua; sugestões disponíveis para alguns bairros";
    return;
  }

  ruasPorBairro[chave].forEach((nomeRua) => {
    const opcao = document.createElement("option");
    opcao.value = nomeRua;
    listaRuas.appendChild(opcao);
  });

  rua.placeholder = "Digite ou selecione uma rua sugerida";
}

function formatarTelefone() {
  let numeros = telefone.value.replace(/\D/g, "").slice(0, 11);

  if (numeros.length > 10) {
    numeros = numeros.replace(
      /^(\d{2})(\d{5})(\d{4})$/,
      "($1) $2-$3"
    );
  } else if (numeros.length > 6) {
    numeros = numeros.replace(
      /^(\d{2})(\d{4})(\d{0,4})$/,
      (_, ddd, inicio, fim) =>
        fim ? `(${ddd}) ${inicio}-${fim}` : `(${ddd}) ${inicio}`
    );
  } else if (numeros.length > 2) {
    numeros = numeros.replace(/^(\d{2})(\d+)/, "($1) $2");
  }

  telefone.value = numeros;
}

function validarTelefone() {
  const numeros = telefone.value.replace(/\D/g, "");

  if (numeros.length !== 10 && numeros.length !== 11) {
    alert("Digite um telefone válido com DDD. Exemplo: (41) 99999-9999.");
    telefone.focus();
    return false;
  }

  if (/^(\d)\1+$/.test(numeros)) {
    alert("Confira o telefone digitado.");
    telefone.focus();
    return false;
  }

  return true;
}

function validarAdicionais() {
  const tamanho = obterTamanho();
  const limite = obterLimite(tamanho);
  const quantidade = obterAdicionaisSelecionados().length;

  if (quantidade > limite) {
    alert(`O copo de ${tamanho} ml permite até ${limite} adicionais.`);
    return false;
  }

  return true;
}

tamanhos.forEach((item) => {
  item.addEventListener("change", () => {
    const tamanho = obterTamanho();
    const limite = obterLimite(tamanho);
    const selecionados = obterAdicionaisSelecionados();

    while (selecionados.length > limite) {
      selecionados[selecionados.length - 1].checked = false;
      selecionados.pop();
    }

    atualizarPedido();
  });
});

adicionais.forEach((item) => {
  item.addEventListener("change", () => {
    const tamanho = obterTamanho();
    const limite = obterLimite(tamanho);
    const selecionados = obterAdicionaisSelecionados();

    if (selecionados.length > limite) {
      item.checked = false;
      avisoAdicionais.textContent =
        `O copo de ${tamanho} ml permite até ${limite} adicionais.`;
      avisoAdicionais.classList.add("erro");
      alert(`Você atingiu o limite de adicionais para o copo de ${tamanho} ml.`);
    }

    atualizarPedido();
  });
});

bairro.addEventListener("input", () => {
  atualizarSugestoesRuas();
  atualizarPedido();
});

telefone.addEventListener("input", formatarTelefone);

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  if (!formulario.reportValidity()) return;

  if (!validarTelefone()) return;

  if (!validarAdicionais()) return;

  const nome = $("#nome").value.trim();
  const telefoneInformado = telefone.value.trim();
  const bairroInformado = bairro.value.trim();
  const ruaInformada = rua.value.trim();
  const numero = $("#numero-casa").value.trim();
  const complemento = $("#complemento").value.trim();
  const observacoes = $("#observacoes").value.trim();

  const tamanho = obterTamanho();
  const selecionados = obterAdicionaisSelecionados();

  const nomesAdicionais = selecionados.length
    ? selecionados.map((item) => item.value).join(", ")
    : "Nenhum";

  const precoCopo = precosCopos[tamanho];
  const precoAdicionais = calcularAdicionais();
  const precoEntrega = calcularEntrega();
  const total = precoCopo + precoAdicionais + precoEntrega;

  const resumo =
    `PEDIDO - CANTINHO DO AÇAÍ\n\n` +
    `Nome: ${nome}\n` +
    `Telefone: ${telefoneInformado}\n` +
    `Tamanho: ${tamanho} ml\n` +
    `Adicionais: ${nomesAdicionais}\n\n` +
    `Rua: ${ruaInformada}, ${numero}\n` +
    `Bairro: ${bairroInformado}\n` +
    `Complemento: ${complemento || "Não informado"}\n` +
    `Observações: ${observacoes || "Nenhuma"}\n\n` +
    `Açaí: ${dinheiro(precoCopo)}\n` +
    `Adicionais: ${dinheiro(precoAdicionais)}\n` +
    `Entrega: ${dinheiro(precoEntrega)}\n` +
    `TOTAL: ${dinheiro(total)}\n\n` +
    `Atenção: este pedido ainda não foi enviado à loja.`;

  alert(resumo);
});

atualizarSugestoesRuas();
atualizarPedido();
