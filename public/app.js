document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.split("/").pop();

  if (path === "criar-enquete.html") {
    // Lógica para a tela de criação de enquetes
    const formEnquete = document.getElementById("form-enquete");
    const opcoesContainer = document.getElementById("opcoes-container");
    const adicionarOpcaoBtn = document.getElementById("adicionar-opcao");

    // Adicionar mais opções ao formulário
    adicionarOpcaoBtn.addEventListener("click", () => {
      const novaOpcao = document.createElement("input");
      novaOpcao.type = "text";
      novaOpcao.className = "opcao-input";
      novaOpcao.placeholder = `Opção ${opcoesContainer.children.length + 1}`;
      novaOpcao.required = true;
      opcoesContainer.appendChild(novaOpcao);
    });

    // Enviar formulário de criação de enquete
    formEnquete.addEventListener("submit", async (e) => {
      e.preventDefault();

      const titulo = document.getElementById("titulo").value;
      const dataInicio = document.getElementById("data_inicio").value;
      const dataTermino = document.getElementById("data_termino").value;

      // Certificando-se de que as opções não estão vazias
      const opcoes = Array.from(document.querySelectorAll(".opcao-input"))
        .map((input) => input.value.trim()) // Usando trim para evitar valores vazios
        .filter((value) => value !== ""); // Filtra valores vazios

      if (opcoes.length === 0) {
        alert("Por favor, adicione ao menos uma opção.");
        return; // Impede que a requisição seja enviada sem opções válidas
      }

      try {
        const response = await fetch("/api/enquetes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            titulo,
            data_inicio: dataInicio,
            data_termino: dataTermino,
            opcoes: opcoes.map((opcao) => ({ texto: opcao })),
          }),
        });

        if (response.ok) {
          alert("Enquete criada com sucesso!");
          formEnquete.reset();
          window.location.href = "main.html";
        } else {
          const errorData = await response.json();
          alert(
            `Erro ao criar enquete: ${errorData.message || "Erro desconhecido"}`
          );
        }
      } catch (error) {
        console.error("Erro ao criar enquete:", error);
        alert("Erro de conexão. Tente novamente.");
      }
    });
  } else if (path === "main.html") {
    // Lógica para a tela principal
    const enquetesContainer = document.getElementById("enquetes");

    // Função para carregar as enquetes
    async function carregarEnquetes() {
      try {
        const response = await fetch("/api/enquetes");
        if (!response.ok) throw new Error("Erro ao carregar enquetes");

        const enquetes = await response.json();
        enquetesContainer.innerHTML = "";

        enquetes.forEach((enquete) => {
          const agora = new Date();
          const termino = new Date(enquete.data_termino);
          const estaExpirada = agora > termino;

          const enqueteElement = document.createElement("div");
          enqueteElement.className = `enquete ${
            estaExpirada ? "expirada" : "ativa"
          }`;
          enqueteElement.innerHTML = `
            <h3>${enquete.titulo}</h3>
            <p>Início: ${new Date(enquete.data_inicio).toLocaleString()}</p>
            <p>Término: ${termino.toLocaleString()}</p>
            <a href="detalhes-enquete.html?id=${enquete.id}">Ver Detalhes</a>
            <button onClick="excluirEnquete(${
              enquete.id
            })" class="btn-excluir">Excluir</button>
          `;
          enquetesContainer.appendChild(enqueteElement);
        });
      } catch (error) {
        console.error("Erro ao carregar enquetes:", error);
      }
    }

    // Função para excluir enquete
    window.excluirEnquete = async (enqueteId) => {
      if (confirm("Tem certeza que deseja excluir esta enquete?")) {
        try {
          const response = await fetch(`/api/enquetes/${enqueteId}`, {
            method: "DELETE",
          });

          if (response.ok) {
            alert("Enquete excluída com sucesso!");
            carregarEnquetes(); // Recarrega a lista de enquetes
          } else {
            alert("Erro ao excluir enquete.");
          }
        } catch (error) {
          console.error("Erro ao excluir enquete:", error);
          alert("Erro ao excluir enquete.");
        }
      }
    };

    // Carregar enquetes ao iniciar
    carregarEnquetes();
  } else if (path === "detalhes-enquete.html") {
    // Lógica para a tela de detalhes da enquete
    const urlParams = new URLSearchParams(window.location.search);
    const enqueteId = urlParams.get("id");

    const tituloEnquete = document.getElementById("titulo-enquete");
    const dataInicio = document.getElementById("data-inicio");
    const dataTermino = document.getElementById("data-termino");
    const opcoesContainer = document.getElementById("opcoes");

    // Função para carregar os detalhes da enquete
    async function carregarDetalhesEnquete() {
      try {
        const response = await fetch(`/api/enquetes/${enqueteId}`);
        if (!response.ok) {
          console.error(
            "Erro ao carregar os detalhes da enquete:",
            response.status
          );
          alert("Erro ao carregar a enquete.");
          return;
        }
        const enquete = await response.json();
        console.log(enquete);

        const isEnqueteAtiva =
          new Date() >= new Date(enquete.data_inicio) &&
          new Date() <= new Date(enquete.data_termino);

        tituloEnquete.textContent = enquete.titulo;
        dataInicio.textContent = `Início: ${new Date(
          enquete.data_inicio
        ).toLocaleString()}`;
        dataTermino.textContent = `Término: ${new Date(
          enquete.data_termino
        ).toLocaleString()}`;

        opcoesContainer.innerHTML = enquete.opcoes
          .map(
            (opcao) => `
            <div class="opcao">
              <span>${opcao.texto}</span>
              <span>${opcao.votos} votos</span>
              <button onclick="votar(${opcao.id})" ${
              !isEnqueteAtiva ? "disabled" : ""
            }>Votar</button>
             <button onclick="tirarVoto(${opcao.id})" class="btn-tirar-voto"
             ${!isEnqueteAtiva ? "disabled" : ""}
             >Tirar Voto</button>
            </div>
          `
          )
          .join("");
      } catch (error) {
        console.error("Erro ao carregar detalhes da enquete:", error);
        alert("Erro ao carregar os detalhes da enquete.");
      }
    }

    // Função de votar no frontend
    window.votar = async (opcaoId) => {
      try {
        const response = await fetch(`/api/opcoes/${opcaoId}/votar`, {
          method: "POST",
        });

        if (response.ok) {
          carregarDetalhesEnquete(); // Atualiza a tela após o voto
        } else {
          const errorData = await response.json();
          console.error("Erro ao votar:", errorData); // Mostra o erro detalhado
          alert("Erro ao votar: " + (errorData.error || "Erro desconhecido"));
        }
      } catch (error) {
        console.error("Erro de conexão:", error); // Captura falhas de rede ou outros erros
        alert("Erro ao tentar votar.");
      }
    };

    // Função para tirar voto
    window.tirarVoto = async (opcaoId) => {
      const response = await fetch(`/api/opcoes/${opcaoId}/tirar_votos`, {
        method: "POST",
      });

      if (response.ok) {
        carregarDetalhesEnquete(); // Atualiza a tela após tirar o voto
      } else {
        alert("Erro ao tirar o voto.");
      }
    };

    carregarDetalhesEnquete();
  }
});
