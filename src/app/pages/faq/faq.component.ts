import { Component } from '@angular/core';

@Component({
  selector: 'app-faq',
  standalone: true,
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent {
  faqs: { pergunta: string; resposta: string }[] = [
    {
      pergunta: 'Qual o dress code?',
      resposta: 'Traje social. Evite cores que destaquem demais (ex.: branco, vermelho forte).',
    },
    {
      pergunta: 'Haverá estacionamento?',
      resposta: 'Sim, o local possui estacionamento gratuito para os convidados.',
    },
    {
      pergunta: 'Posso levar acompanhantes?',
      resposta: 'Sim, por favor indique o número de acompanhantes na confirmação de presença (RSVP).',
    },
    {
      pergunta: 'Crianças são bem-vindas?',
      resposta: 'Sim, todas as idades são bem-vindas ao nosso casamento.',
    },
    {
      pergunta: 'Como chegar ao local?',
      resposta: 'O endereço completo está na página Cerimônia. Você pode usar o link do mapa para visualizar a rota.',
    },
  ];
}
