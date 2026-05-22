import React from 'react';
import './KanbanBoard.css';

export default function KanbanBoard({ quotes, onCardClick }) {
  const columns = ['Active', 'Pending', 'Won', 'Lost'];
  
  const getQuotesForColumn = (col) => {
    return quotes.filter(q => q.status === col);
  };

  return (
    <div className="kanban-wrapper">
      <div className="kanban-board">
        {columns.map(col => (
          <div key={col} className="kanban-column">
            <div className="kanban-column-header">
              <h4>{col}</h4>
              <span className="kanban-count">{getQuotesForColumn(col).length}</span>
            </div>
            
            <div className="kanban-cards">
              {getQuotesForColumn(col).map((quote, idx) => (
                <div key={quote.id || idx} className="kanban-card" onClick={() => onCardClick(quote)}>
                  <div className="kanban-card-title">{quote.customer}</div>
                  <div className="kanban-card-value">${(quote.quoteNo ? quote.quoteNo.charCodeAt(0) * 1250 : 50000).toLocaleString()}</div>
                  <div className="kanban-card-meta">
                    <span>{quote.rep}</span>
                    <span>{quote.quoteDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
