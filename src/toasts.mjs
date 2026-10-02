import React from 'https://esm.sh/react@18.3.1';
import { createRoot } from 'https://esm.sh/react-dom@18.3.1/client';
import { ToastContainer, toast, Bounce } from 'https://esm.sh/react-toastify@11.1.0?external=react,react-dom';

const rootNode = document.getElementById('toast-root');

function EventToast({ event }) {
  const lines = [];
  if (event.benefited?.length) lines.push('Favorece: ' + event.benefited.join(' · '));
  if (event.harmed?.length) lines.push('Prejudica: ' + event.harmed.join(' · '));
  if (event.effects?.length) lines.push(...event.effects);
  if (!event.effects?.length) lines.push('A sopa permaneceu estável neste pulso.');

  return React.createElement(
    'div',
    { className: 'environment-toast-content' },
    React.createElement('div', { className: 'environment-toast-title' },
      React.createElement('span', { className: 'environment-toast-icon' }, event.icon),
      React.createElement('div', null,
        React.createElement('strong', null, event.title),
        React.createElement('small', null, 'Início do turno de ' + event.player)
      )
    ),
    React.createElement(
      'div',
      { className: 'environment-toast-lines' },
      lines.map((line, index) => React.createElement('div', { key: index }, line))
    )
  );
}

if (rootNode) {
  createRoot(rootNode).render(
    React.createElement(ToastContainer, {
      position: 'top-right',
      autoClose: 6500,
      hideProgressBar: false,
      newestOnTop: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'dark',
      transition: Bounce,
      limit: 3
    })
  );
}

window.SopaToast = {
  showEvent(event) {
    if (!event) return;
    toast(React.createElement(EventToast, { event }), {
      toastId: 'turn-event-' + event.id,
      className: 'environment-toast'
    });
  }
};

const queued = window.SopaToastQueue || [];
queued.splice(0).forEach(event => window.SopaToast.showEvent(event));
window.dispatchEvent(new CustomEvent('sopa:toast-ready'));
