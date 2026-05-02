import React from 'react';

const Timeline = React.memo(({ steps, activeStep, setActiveStep }) => {
  return (
    <section 
      className="glass-card" 
      aria-labelledby="timeline-heading"
    >
      <h2 id="timeline-heading" className="timeline-title" style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>
        The Indian Election Timeline
      </h2>
      <div className="timeline" role="list">
        {steps.map((step) => (
          <div 
            key={step.id} 
            className={`timeline-item ${activeStep === step.id ? 'active' : ''}`}
            onClick={() => setActiveStep(step.id)}
            role="listitem"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setActiveStep(step.id);
              }
            }}
            aria-current={activeStep === step.id ? "step" : undefined}
            aria-label={`Step ${step.id}: ${step.title}`}
          >
            <div className="timeline-icon-wrap" aria-hidden="true">
              <div className="timeline-icon">{step.icon}</div>
            </div>
            <div className="timeline-content">
              <div className="timeline-date" aria-label={`Phase: ${step.date}`}>{step.date}</div>
              <h3 className="timeline-title">{step.title}</h3>
              <p className="timeline-desc">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

Timeline.displayName = 'Timeline';

export default Timeline;
