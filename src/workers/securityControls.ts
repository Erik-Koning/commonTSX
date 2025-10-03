export const securityControlsCategories = [
  "Data & Privacy",
  "Infra",
  "Product",
  "Policies",
  "Organizational",
  "Access Control",
  "Risk Management",
  "Incident Response",
  "Vendor Management",
] as const;

//other categories could be added later:   //"Business Continuity",   //"Security Monitoring",   //"Compliance", //"Physical Security"

export const soc2Framework = {
  name: "SOC 2",
  description: "SOC 2 Framework",
  version: "2022",
};

export const soc2Categories = [
  {
    name: "CC1: Control Environment",
    code: "SOC_2_1",
    description:
      "Evaluates the organization's commitment to integrity and ethical values, board independence and oversight, management's philosophy and operating style, organizational structure, and human resource policies.",
  },
  {
    name: "CC2: Communications and Information",
    code: "SOC_2_2",
    description:
      "Addresses how the organization obtains and communicates relevant information internally and externally to support the functioning of internal control and achievement of objectives.",
  },
  {
    name: "CC3: Risk Assessment",
    code: "SOC_2_3",
    description:
      "Examines how the organization identifies, analyzes, and manages risks that could affect its ability to achieve its objectives and implements processes to identify and assess changes that could impact the system of internal control.",
  },
  {
    name: "CC4: Monitoring Controls",
    code: "SOC_2_4",
    description:
      "Focuses on how the organization selects, develops, and performs ongoing evaluations to determine whether internal controls are present and functioning, and how it communicates deficiencies for timely corrective action.",
  },
  {
    name: "CC5: Control Activities",
    code: "SOC_2_5",
    description:
      "Assesses the policies and procedures that help ensure management directives are carried out, including activities such as authorizations, verifications, reconciliations, reviews, and segregation of duties.",
  },
  {
    name: "CC6: Logical and Physical Access Controls",
    code: "SOC_2_6",
    description:
      "Evaluates controls that restrict logical and physical access to system resources, prevent unauthorized access, and protect system boundaries through authentication and authorization mechanisms.",
  },
  {
    name: "CC7: System Operations",
    code: "SOC_2_7",
    description:
      "Reviews how the organization monitors system operations, detects and responds to processing deviations, and implements incident management processes to identify, report, and resolve operational issues.",
  },
  {
    name: "CC8: Change Management",
    code: "SOC_2_8",
    description:
      "Examines processes for authorizing, designing, developing, configuring, documenting, testing, approving, and implementing changes to infrastructure, software, and procedures.",
  },
  {
    name: "CC9: Risk Mitigation",
    code: "SOC_2_9",
    description:
      "Focuses on business continuity management, disaster recovery planning, and vendor risk management processes including due diligence in selection and ongoing monitoring of third-party service providers.",
  },
];

export const ISO_27001_Categories = [
  {
    name: "Technological Controls",
    code: "ISO_27001_8",
  },
  {
    name: "Physical and Environmental Controls",
    code: "ISO_27001_7",
  },
  {
    name: "People Controls",
    code: "ISO_27001_6",
  },
  {
    name: "Organizational Controls",
    code: "ISO_27001_5",
  },
];

export type standards = "SOC_2" | "ISO_27001" | "Internal" | "PIPEDA" | "HIPAA" | "PCI_DSS_3_2_1";
export type artifactTypes = "policy" | "procedure" | "training" | "evidence";

export type securityControls = {
  controls: {
    code: string | string[];
    name: string;
    category: (typeof securityControlsCategories)[number] | (typeof securityControlsCategories)[number][];
    tests: boolean | string[]; //if true a test exists in the cron to check the security controls status, should only be false if untestable or not yet implemented
    satisfied?: boolean;
    standards: Partial<
      Record<
        standards,
        | {
            title?: string;
            description: string;
            categoryId?: string;
          }
        | string
      >
    >;
    requiredArtifactTypes: artifactTypes[];
    artifacts?: {
      policy?: string;
      procedure?: string;
      training?: string;
      evidence?: string;
    };
    more?: string; //user facing more info about the control, how its setup, etc.
  }[];
};

export const securityControls: securityControls = {
  controls: [
    // CC1: Control Environment
    {
      code: ["SOC_2_1.1.1", "ISO_27001_5.1"],
      name: "Board Oversight",
      tests: false,
      category: "Organizational",
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity's board of directors demonstrates a commitment to integrity, ethical values, independence from management, and exercises effective oversight of the development and performance of internal control, including evaluating management's risk assessment and monitoring activities. Entity has approved security policies, and all employees accept these procedures when hired. Management also ensures that security policies are accessible to all employees and contractors.",
          categoryId: "CC1",
        },
        ISO_27001: {
          description:
            //todo
            "Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties, and reviewed at planned intervals and if significant changes occur.",
        },
      },

      requiredArtifactTypes: ["policy", "procedure"],
    },
    {
      code: ["SOC_2_1.2", "ISO_27001_5.4"],
      name: "Management Philosophy",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "Management establishes and maintains organizational structures, reporting lines, and appropriate authority and responsibility boundaries in pursuit of objectives, with clear accountability for control domain management.",
          categoryId: "CC1",
        },
        ISO_27001: {
          description: "Ensure all staff members follow the organization's security policies and procedures in their daily work.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure"],
    },
    {
      code: ["SOC_2_1.3", "ISO_27001_5.2"],
      name: "Organizational Structure",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity demonstrates a commitment to attracting, developing, and retaining competent individuals in alignment with its objectives, including defining responsibilities and conducting periodic performance reviews.",
          categoryId: "CC1",
        },
        ISO_27001: {
          description: "Clearly define and assign security roles and responsibilities based on organizational needs.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure"],
    },
    {
      code: ["SOC_2_1.4"],
      name: "Personnel Policies",
      category: "Policies",
      tests: false,
      satisfied: true, //TODO confirm we have artifacts for this
      standards: {
        SOC_2: {
          description:
            "The entity holds individuals accountable for their internal control responsibilities, implementing appropriate measurements, incentives, and rewards for adherence to established practices and consequences for violations.",
          categoryId: "CC1",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "training"],
    },
    {
      code: ["INT_1"],
      name: "Domain Name System Security Extensions",
      tests: ["0"], //test that DNSSEC is enabled for the domain
      category: "Infra",
      standards: {
        Internal: "Domain Name System Security Extensions are implemented and configured correctly.",
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      more: "validate that the DNS responses received are authentic and haven't been tampered with. DNSSEC can be enabled by companies looking to improve their security posture, including U.S. federal government entities and those that offer their services to them as part of the FedRAMP program.",
    },
    {
      code: ["INT_2"],
      name: "All API's Are Protected by Authentication and Authorization Check",
      tests: false, //TODO, could mve the test for this to github and check it passes there.
      satisfied: true,
      category: "Product",
      standards: {
        Internal: "All API's are protected by authentication and authorization checks.",
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      more: "When someone makes a request to an API, the request is authenticated and authorized to ensure that the request is coming from a valid source and that the source has the necessary permissions to access the resource.",
    },
    {
      code: ["INT_3"],
      name: "Local Development Environment",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        Internal:
          "Development machines are regularly scanned for vulnerabilities, utilize VPNs, and are protected by firewalls. Device security, and malware protection software is utilized which is certified to be SOC2 compliant, ISO 27001, ISO 27017, ISO 27018, ISO 9001 and HIPAA Compliant.",
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      more: "We chose to use BitDefender malware protection software, which is certified and proven to detect 100% of Mac malware as tested by AV-Comparatives 2024.",
    },
    {
      code: ["INT_4"],
      name: "No deprovisioned AWS accounts",
      category: "Infra",
      tests: ["2"],
      standards: {
        Internal:
          "There should be no deprovisioned AWS accounts as they may have zombie resources that could be exploited. Accounts should be closed and fully deleted.",
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["INT_5"],
      name: "No root account access keys",
      category: "Infra",
      tests: ["4"],
      standards: {
        Internal: "There should be no root account access keys as they may be exploited.",
        PCI_DSS_3_2_1: {
          description: "IAM root user access key should not exist",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["INT_6"],
      name: "No public SSH access",
      category: "Infra",
      tests: ["5"],
      standards: {
        Internal: "There should be no public SSH access as it may be exploited.",
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["INT_7"],
      name: "Certified Cloud Developers",
      category: "Organizational",
      tests: ["6"],
      standards: {
        Internal:
          'All cloud developers and engineers who deploy code and/or resources to the cloud, must hold a valid "cloud solutions architect" certification issued by the respective cloud resource provider.',
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_1.5"],
      name: "Code of Conduct",
      category: "Policies",
      tests: false,
      satisfied: true, //TODO confirm policy for this
      standards: {
        SOC_2: {
          description:
            "The entity demonstrates a commitment to integrity and ethical values through establishment of standards of conduct, enforcement of accountability, and evaluation of adherence to ethical and legal requirements.",
          categoryId: "CC1",
        },
      },
      requiredArtifactTypes: ["policy", "training"],
    },

    // CC2: Communication and Information
    {
      code: ["SOC_2_2.1"],
      name: "Information Quality",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity obtains or generates and uses relevant, quality information from both internal and external sources to support the functioning of internal control and inform decision-making.",
          categoryId: "CC2",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_2.2"],
      name: "Internal Communication",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity internally communicates information, including objectives and responsibilities for internal control, necessary to support the functioning of internal control through established channels and processes.",
          categoryId: "CC2",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_2.2.1"],
      name: "Internal Reporting",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "Provides a process to employees for reporting security features, incidents, and concerns, and other complaints to company management.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_2.2.2"],
      name: "Incident Response",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "Entity has implemented an incident response plan that includes creating, prioritizing, assigning, and tracking follow-ups to completion and lend support to business continuity/disaster recovery.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_2.2.3"],
      name: "Incident Response Plan",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity has an incident response plan that includes creating, prioritizing, assigning, and tracking follow-ups to completion and lend support to business continuity/disaster recovery.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_2.2.4"],
      name: "Incident Response Team",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity has an incident response team that includes creating, prioritizing, assigning, and tracking follow-ups to completion and lend support to business continuity/disaster recovery.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_2.2.5"],
      name: "Incident Response Plan and Analysis",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "implemented an incident response plan that includes documenting lessons learned and a root cause analysis after incidents and sharing them with the broader engineering team to support business continuity/disaster recovery.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_2.2.6"],
      name: "Security Team Communication",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "Security team communicates important information security events to company management in a timely manner.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_2.3"],
      name: "External Communication",
      category: "Policies",
      tests: false,
      satisfied: false, //todo, organization to consult with
      standards: {
        SOC_2: {
          description:
            "The entity communicates with external parties regarding matters affecting the functioning of internal control, including compliance requirements, service commitments, and system requirements.",
          categoryId: "CC2",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_2.3.1"],
      name: "Security Controls Public Access",
      category: "Product",
      tests: false,
      satisfied: false, //todo, organization to consult with
      standards: {
        SOC_2: {
          description: "Security commitments are communicated to external users, as appropriate.",
          categoryId: "CC2",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_2.3.2"],
      name: "System Changes",
      category: "Product",
      tests: false,
      satisfied: false,
      standards: {
        SOC_2: {
          description: "communicates system changes to customers that may affect security, availability, processing integrity, or confidentiality.",
          categoryId: "CC2",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_2.3.3"],
      name: "System Security Reporting",
      category: "Product",
      tests: false,
      satisfied: false, //todo add contact method to trust center
      standards: {
        SOC_2: {
          description:
            "provides a process to external users for reporting security, confidentiality, integrity, and availability failures, incidents, concerns, and other complaints.",
          categoryId: "CC2",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_2.3.4"],
      name: "Security Controls Public Access",
      category: "Product",
      tests: false,
      satisfied: false, //todo add contact method to trust center
      standards: {
        SOC_2: {
          description:
            "Maintains a privacy policy that is available to all external users and internal employees, and it details the Company's confidentiality and privacy commitments.",
          categoryId: "CC2",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_2.3.5"],
      name: "Terms of Service and Agreements",
      category: "Product",
      tests: false,
      satisfied: false, //todo add contact method to trust center
      standards: {
        SOC_2: {
          description:
            "Maintains a terms of service that is available to all external users and internal employees, and the terms detail the Company's security and availability commitments regarding the systems. Client agreements or master service agreements are in place for when the terms of service may not apply.",
          categoryId: "CC2",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_2.3.6"],
      name: "Security Deficiencies",
      category: "Product",
      tests: false,
      satisfied: false, //todo add contact method to trust center
      standards: {
        SOC_2: {
          description: "tracks security deficiencies through internal tools and closes them within an SLA that management has pre-specified.",
          categoryId: "CC2",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    // CC3: Risk Assessment
    {
      code: ["SOC_2_3.1"],
      name: "Risk Assessment Process",
      category: "Risk Management",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity specifies objectives with sufficient clarity to enable the identification and assessment of risks relating to objectives, considering both internal and external factors that could impact goal achievement.",
          categoryId: "CC3",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_3.1.1"],
      name: "Risk Assessment Process",
      category: "Risk Management",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "Has defined a formal risk management process that specifies risk tolerances and the process for evaluating risks based on identified threats and the specified tolerances. Conducts a risk assessment at least annually.",
          categoryId: "CC3",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_3.1.2"],
      name: "Risk Remediation",
      category: "Risk Management",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "Management prepares a remediation plan to formally manage the resolution of findings identified in risk assessment activities.",
          categoryId: "CC3",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_3.1.3"],
      name: "Vulnerability Scans",
      category: "Risk Management",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "Entity engages with third-party to conduct vulnerability scans of the production environment at least quarterly. Results are reviewed by management and high priority findings are tracked to resolution.",
          categoryId: "CC3",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_3.2"],
      name: "Risk Identification",
      category: "Risk Management",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity identifies and systematically analyzes risks to the achievement of its objectives across the organization as a basis for determining appropriate risk responses and mitigation strategies.",
          categoryId: "CC3",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_3.3"],
      name: "Fraud Risk Assessment",
      category: "Risk Management",
      tests: false,
      satisfied: true, //TODO add to risk assessment
      standards: {
        SOC_2: {
          description:
            "The entity considers the potential for fraud, including fraudulent reporting, misappropriation of assets, and corruption, when assessing risks to the achievement of objectives.",
          categoryId: "CC3",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_3.4"],
      name: "Change Management Risk",
      category: "Risk Management",
      tests: false,
      satisfied: true, //TODO add PP for assessing any change to how we do business
      standards: {
        SOC_2: {
          description:
            "The entity identifies and systematically assesses changes that could significantly impact the system of internal control, including changes to the external environment, business model, leadership, and technology.",
          categoryId: "CC3",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    // CC4: Monitoring Activities
    {
      code: ["SOC_2_4.1"],
      name: "Control Monitoring",
      category: ["Risk Management", "Infra"],
      tests: ["3"], //Test that the continuous monitoring is atleast running regularly.
      standards: {
        SOC_2: {
          description:
            "The entity selects, develops, and performs ongoing and/or separate evaluations to ascertain whether the components of internal control are present and functioning effectively, using a combination of continuous monitoring and periodic assessments.",
          categoryId: "CC4",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_4.2"],
      name: "Deficiency Management",
      category: "Risk Management",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity evaluates and communicates internal control deficiencies in a timely manner to responsible parties, including senior management and the board of directors, and implements corrective actions to remediate identified issues.",
          categoryId: "CC4",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    // CC5: Control Activities
    {
      code: ["SOC_2_5.1"],
      name: "Control Selection",
      category: "Organizational",
      tests: false,
      satisfied: true, //TODO ask chat about this
      standards: {
        SOC_2: {
          description:
            "The entity selects and develops control activities that contribute to the mitigation of risks to acceptable levels, integrating controls into business processes and considering entity-specific factors in their design.",
          categoryId: "CC5",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_5.2"],
      name: "Technology Controls",
      category: "Infra",
      tests: false,
      satisfied: true, //TODO What was original def of this?
      standards: {
        SOC_2: {
          description:
            "The entity selects and develops general control activities over technology to support the achievement of objectives, including infrastructure management, security administration, and change management controls.",
          categoryId: "CC5",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_5.3"],
      name: "Policy Implementation",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity deploys control activities through documented policies that establish expectations and procedures that put policies into action, with defined responsibilities, timeframes, and corrective measures for deviations.",
          categoryId: "CC5",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["ISO_27001_5.3"],
      name: "Segregation of Duties",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description: "Separate conflicting job duties and areas of responsibility to reduce risks of accidental or deliberate misuse.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["ISO_27001_5.5"],
      name: "Contact with Authorities",
      category: "Policies",
      tests: false,
      satisfied: true, //TODO, subscribe to security authorities, and domain specific authorities
      standards: {
        ISO_27001: "Maintain active relationships and communication channels with relevant security and regulatory authorities.",
        Internal:
          "Chief Privacy Officer is subscribed and alerted immediately to bleeding-edge security best practices from reputable & international security authorities",
      },
      requiredArtifactTypes: ["policy", "procedure"],
    },
    {
      code: ["ISO_27001_5.6"],
      name: "Contact with Special Interest Groups",
      category: "Policies",
      tests: false,
      satisfied: true, //TODO join security forums, and webcrawl hacker news sites for updates
      standards: {
        ISO_27001: "Actively participate in security forums and professional networks to stay current with security trends and best practices.",
        Internal: "Chief Privacy Officer is a member of reputable security forums, and is regularly updated to new security threats and defense.",
      },
      requiredArtifactTypes: ["policy", "procedure"],
    },
    {
      code: ["ISO_27001_5.7"],
      name: "Threat Intelligence",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description: "Gather and analyze security threat information to create actionable intelligence for protecting the organization.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_5.8"],
      name: "Information Security in Project Management",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description: "Build security considerations into all stages of project management from planning to delivery.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure"],
    },

    {
      code: ["ISO_27001_5.10"],
      name: "Acceptable Use of Information",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description: "Create and enforce clear guidelines for how information and assets should be used and handled.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "training"],
    },
    {
      code: ["ISO_27001_5.11"],
      name: "Return of assets",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description: "Ensure all company assets are returned when employees leave or contracts end.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["ISO_27001_5.12"],
      name: "Classification of information",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description: "Classify information based on its sensitivity, importance, and legal requirements.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["ISO_27001_5.13"],
      name: "Labelling of information",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description: "Implement clear procedures for labeling information according to its classification level.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["ISO_27001_5.14"],
      name: "Information transfer",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description: "Establish secure methods and rules for transferring information both within and outside the organization.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_6.1", "ISO_27001_5.15"],
      name: "Access Security",
      category: "Access Control",
      tests: false,
      satisfied: true, //TODO , clarify description
      standards: {
        SOC_2: {
          description:
            "The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events, employing defense-in-depth strategies and industry-standard practices.",
          categoryId: "CC6",
        },
        ISO_27001: {
          description:
            "Set up and enforce clear rules about who can access what information and systems, based on business needs and security requirements.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_6.1.1"],
      name: "Version Control",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "Implements a version control system to manage source code, documentation, release labeling, and other change management tasks. Access to the system must be approved by a system admin.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_6.1.2"],
      name: "Hardening Standards",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "Hardening standards are in place to ensure that newly deployed server instances are appropriately secured.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_6.1.3"],
      name: "Network Diagram",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "maintains an accurate network diagram that is accessible to the engineering team and is reviewed by management on an annual basis.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_6.1.4"],
      name: "Password Manager",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "Ensures that a password manager is installed on all company-issued laptops.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_6.1.5"],
      name: "Encrypted Hard-Disks",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "Company-issued laptops have encrypted hard-disks.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_6.1.6"],
      name: "Encrypted Databases",
      category: "Data & Privacy",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "Stores data in databases that is encrypted at rest.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_6.1.8"],
      name: "Application Authentication",
      category: "Product",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "Application user passwords are stored using a salted password hash. Sign-in signatures such as IP, device, and time are stored to compare against future sign-ins. Up-holds established formal guidelines for passwords to govern the management and use of authentication mechanisms.",
        },
        //TODO make sure as strong as AWS password policy
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_6.1.9"],
      name: "Role-based access control",
      category: "Product",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "Role-based security is in place for internal and external users, including super admin users.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_6.1.10"],
      name: "Application Re-Authentication",
      category: "Product",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "Entity requires two factor authentication to access sensitive systems and applications in the form of user ID, password, OTP and/or certificate.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_6.1.12"],
      name: "Employee Access",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "Employee access is restricted to the systems and applications that are necessary for the performance of their job duties.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_6.1.13"],
      name: "Employee Unique ID",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "Access to corporate network, production machines, network devices, and support tools requires a unique ID",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_6.1.14"],
      name: "Employee Access to Corporate Network",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "Users can only access the production system remotely through the use of encrypted communication systems.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_6.1.15"],
      name: "Access Key Management",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "has an established key management process in place to support the organization's use of cryptographic techniques.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_6.1.16"],
      name: "Cryptographic Controls",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "has a defined policy that establishes requirements for the use of cryptographic controls.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["ISO_27001_5.16"],
      name: "Identity management",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description: "Manage user identities throughout their entire lifecycle, from creation to deletion.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_6.2", "ISO_27001_5.17"],
      name: "Access Authentication",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "Prior to issuing system credentials and granting system access, the entity registers and authorizes new internal and external users through formal onboarding processes that verify identity and establish appropriate access levels.",
          categoryId: "CC6",
        },
        ISO_27001: {
          description: "Control how authentication credentials are assigned and managed, and train users on proper credential handling.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_6.2.1"],
      name: "Access Control Policy",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "Entity has a defined system access control policy that requires annual access control reviews to be conducted and access request forms be filled out for new hires and employee transfers.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_6.2.2"],
      name: "Access Control Reviews",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "Annual access control reviews are conducted and access request forms are filled out for new hires and employee transfers.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_6.2.3"],
      name: "Termination Checklist",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "Entity uses a termination checklist to ensure that an employee's system access, including physical access, is removed within a specified timeframe and all organization assets (physical or electronic) are properly returned.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_6.2.4"],
      name: "Terms of Service Acceptance",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "External users must accept the terms of service prior to their account being created.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_6.2.5"],
      name: "Infra and Code Access, Termination Policy",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "Infra and code access, termination policy is in place. Access to infrastructure and code review tools is removed from terminated employees within one business day.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_6.3"],
      name: "Access Removal",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity promptly removes access to protected information assets when personnel roles change or employment is terminated, following a standardized process to ensure complete revocation of privileges.",
          categoryId: "CC6",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_6.4", "ISO_27001_5.18"],
      name: "Access Review",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity evaluates and manages access to protected information assets on a periodic basis, performing formal reviews of user accounts, access rights, and privileged access to identify and remediate inappropriate access.",
          categoryId: "CC6",
        },
        ISO_27001: {
          description: "Regularly review and update access rights to ensure they remain appropriate and aligned with security policies.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["ISO_27001_5.19"],
      name: "Information security in supplier relationships",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: "Implement processes to manage security risks from supplier products and services.",
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        policy: "todo link to policy",
      },
    },
    {
      code: ["SOC_2_6.1.7"],
      name: "System Account Management",
      category: "Access Control",
      tests: ["1"],
      standards: {
        SOC_2: {
          description:
            "Username and password (password standard implemented) or SSO required to authenticate into application, MFA optional for external users, and MFA required for employee users.",
        },
        Internal: {
          description:
            "All entity users require multi-factor authentication, strong passwords, and secure credential management. End users are suggested to do the same, full list of best practices for end users can be found on our FAQ & help center",
          title: "Multi-factor Authentication (MFA)",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
      more: "All systems handling sensitive information have policies to require users have MFA enabled",
    },
    {
      code: ["SOC_2_6.6"],
      name: "Access Restrictions",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity restricts physical access to facilities and protected information assets through badge access, visitor management, monitoring systems, and environmental controls to prevent unauthorized access.",
          categoryId: "CC6",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
      more: "Entity keeps a log of all locations with sensitive information and implements the restrictions at each location",
    },
    {
      code: ["SOC_2_6.7"],
      name: "Information Asset Changes",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity manages changes to system components and software through formal change management processes to minimize the risk of unauthorized or inadvertent changes affecting system security and availability.",
          categoryId: "CC6",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    // CC7: System Operations
    {
      code: ["SOC_2_7.1"],
      name: "Infrastructure Monitoring",
      category: "Infra",
      tests: ["6"], //AWS service to monitor infrastructure, threats, new vulnerabilities, etc.
      standards: {
        SOC_2: {
          description:
            "To detect and act upon security events in a timely manner, the entity monitors system capacity, security threats, changing regulatory requirements, and vulnerability assessments through automated tools and manual processes.",
          categoryId: "CC7",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_7.2", "ISO_27001_5.26"],
      name: "Security Event Response",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity designs, develops, and implements comprehensive policies and procedures to respond to security incidents and breaches, including defined roles, response protocols, and communication procedures.",
          categoryId: "CC7",
        },
        ISO_27001: {
          description:
            "Security incidents must be handled according to established incident response procedures, including clear steps for identification, containment, eradication, recovery, and lessons learned.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },
    {
      code: ["SOC_2_7.2.1"],
      name: "Server Logs",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "Implements a system that collects and stores server logs in a central location. The system can be queried in an ad hoc fashion by authorized users.",
          categoryId: "CC7",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_7.2.2"],
      name: "Logging of Alerts",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "Makes use of logging software that sends alerts to appropriate personnel. Corrective actions are performed, as necessary, in a timely manner.",
          categoryId: "CC7",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_7.3"],
      name: "Cloud Infrastructure Monitoring",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "Cloud infrastructure is monitored through an operational audit system that sends alerts to appropriate personnel.",
          categoryId: "CC7",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_7.3"],
      name: "Security Event Recovery",
      category: "Incident Response",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity implements recovery procedures to ensure timely restoration of systems or assets affected by security incidents, including backup strategies, system redundancy, and documented recovery plans.",
          categoryId: "CC7",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },
    {
      code: ["SOC_2_7.4", "ISO_27001_5.27"],
      name: "Security Event Analysis",
      category: "Incident Response",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity implements incident response activities to identify root causes of security incidents, develop remediation plans, establish preventive measures, and integrate lessons learned into future security practices.",
          categoryId: "CC7",
        },
        ISO_27001: {
          description: "Knowledge gained from information security incidents shall be used to strengthen and improve the information security controls.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },
    {
      code: ["SOC_2_7.5"],
      name: "Disaster Recovery",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "The entity identifies, develops, and implements activities to recover from identified security incidents",
          categoryId: "CC7",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_7.5.1"],
      name: "Disaster Recovery Plan",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "The entity has a disaster recovery plan in place.",
          categoryId: "CC7",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_7.5.2"],
      name: "Daily Backups",
      category: "Data & Privacy",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "Performs backups daily and retains them in accordance with a predefined schedule in the Backup Policy.",
          categoryId: "CC7",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_7.5.3"],
      name: "Disaster Recovery Testing",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "The entity tests the disaster recovery plan periodically.",
          categoryId: "CC7",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_7.5.4"],
      name: "Business Continuity Plan",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "Has a defined business continuity plan that outlines the proper procedures to respond, recover, resume, and restore operations following a disruption or significant change.",
          categoryId: "CC7",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    // CC8: Change Management
    {
      code: ["SOC_2_8.1"],
      name: "Change Authorization",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity authorizes, designs, develops, configures, documents, tests, approves, and securely implements changes to infrastructure, data, software, and procedures through a formalized change management process with appropriate segregation of duties.",
          categoryId: "CC8",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },
    {
      code: ["SOC_2_8.1.1"],
      name: "Authorized Deployment",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: `Only MFA and suitably authorized ${process.env.NEXT_PUBLIC_APP_TITLE} personnel can push or make changes to production code.`,
          categoryId: "CC8",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["SOC_2_8.1.2"],
      name: "Change Management Policy",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: `Separate environments are used for testing and production for ${process.env.NEXT_PUBLIC_APP_TITLE}'s application.`,
          categoryId: "CC8",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["SOC_2_8.1.3"],
      name: "System Development Life Cycle",
      category: "Product",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            `${process.env.NEXT_PUBLIC_APP_TITLE} has developed policies and procedures governing the system development life cycle, including documented policies for tracking, testing, approving, and validating changes.`,
          categoryId: "CC8",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["SOC_2_8.1.4"],
      name: "Change Testing",
      category: "Product",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "Code changes are tested prior to deployment to ensure quality and security. Aswell as approval from appropriate members of management prior to production release.",
          categoryId: "CC8",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    // CC9: Risk Mitigation
    {
      code: ["SOC_2_9.1"],
      name: "Business Continuity Planning",
      category: "Risk Management",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity identifies, develops, and implements comprehensive activities to recover and restore critical information technology resources during disruptions, with documented procedures for various disaster scenarios.",
          categoryId: "CC9",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },
    {
      code: ["SOC_2_9.1.1"],
      name: "Business Continuity Testing",
      category: "Risk Management",
      tests: false,
      satisfied: false, //TODO implement SOC_2_9.1.1
      standards: {
        SOC_2: {
          description: `${process.env.NEXT_PUBLIC_APP_TITLE} conducts annual BCP/DR tests and documents according to the BCDR Plan.`,
          categoryId: "CC9",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },
    {
      code: ["SOC_2_9.1.2"],
      name: "Data Replication",
      category: "Data & Privacy",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "Utilizes multiple availability zones to replicate production access across different zones.",
          categoryId: "CC9",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_9.1.3"],
      name: "Cybersecurity Insurance",
      category: "Risk Management",
      tests: false,
      satisfied: false, //TODO update when insurance is in place
      standards: {
        SOC_2: {
          description: "Maintains cybersecurity insurance to mitigate the financial impact of business disruptions.",
          categoryId: "CC9",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["SOC_2_9.2"],
      name: "Vendor Risk Management",
      category: "Risk Management",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity assesses and manages risks associated with vendors and business partners through formal due diligence processes, contractual requirements, ongoing monitoring, and periodic reassessment of third-party relationships.",
          categoryId: "CC9",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },
    {
      code: ["SOC_2_9.9"],
      name: "Business Continuity and Disaster Recovery Testing",
      category: "Risk Management",
      tests: false,
      satisfied: true, // Test DB backup, etc.
      standards: {
        SOC_2: {
          description:
            "The entity regularly tests business continuity and disaster recovery plans through tabletop exercises and simulations, evaluates the test results against recovery objectives, and updates the plans to address identified gaps.",
          categoryId: "CC9",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },

    // More ISO_27001 controls to add to the controls array

    {
      code: ["ISO_27001_5.20", "SOC_2_2.3.7"],
      name: "Addressing Information Security Within Supplier Agreements",
      category: "Vendor Management",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description: "Include specific security requirements in supplier agreements based on the type of relationship and access level.",
        },
        SOC_2: {
          description:
            "maintains a directory of its key vendors, including its agreements that specify terms, conditions, responsibilities and compliance reports. Critical vendor compliance reports are reviewed annually.",
          categoryId: "CC2",
        },
      },
      requiredArtifactTypes: ["evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },

    {
      code: ["SOC_2_2.3.8"],
      name: "Vendor Management Policy",
      category: "Vendor Management",
      tests: false,
      satisfied: false, //TODO add contact method to trust center
      standards: {
        SOC_2: {
          description:
            `${process.env.NEXT_PUBLIC_APP_TITLE} has a defined vendor management policy that establishes requirements of ensuring third-party entities meet the organization's data preservation and protection requirements.`,
          categoryId: "CC2",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_5.21"],
      name: "Information and Communication Technology (ICT) Supply Chain Security",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description: "Establish security controls for managing risks in the ICT supply chain.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },

    {
      code: ["ISO_27001_5.22"],
      name: "Monitoring of Supplier Services",
      category: "Vendor Management",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description: "Regularly monitor and review supplier security practices and service delivery quality.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },

    {
      code: ["ISO_27001_5.23"],
      name: "Cloud Services Security",
      category: "Vendor Management",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description: "Define and follow security procedures for acquiring, using, managing and ending cloud service relationships.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },
    {
      code: ["ISO_27001_5.24", "SOC_2_7.2"],
      name: "Information Security Incident Management Planning",
      category: "Incident Response",
      tests: false,
      satisfied: true, //TODO increase policy coverage with role and responsibility policy
      standards: {
        ISO_27001: {
          description:
            "Establish and communicate comprehensive incident response plans that clearly define roles, responsibilities, and procedures for handling security incidents.",
        },
        SOC_2: {
          description:
            "The entity designs, develops, and implements comprehensive policies and procedures to respond to security incidents and breaches, including defined roles, response protocols, and communication procedures.",
          categoryId: "CC7",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },

    {
      code: ["ISO_27001_5.25"],
      name: "Assessment of Security Events",
      category: "Incident Response",
      tests: ["6"], //TODO which AWS service to monitor infrastructure, threats, new vulnerabilities, etc. where do we store logs?
      standards: {
        ISO_27001: {
          description:
            "Systematically analyze and classify potential security events to determine if they constitute actual security incidents requiring formal response procedures.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_5.28"],
      name: "Collection of Evidence",
      category: "Incident Response",
      tests: ["7"], // We store management logs in CloudTrail, in code we log user access to resources
      standards: {
        ISO_27001: {
          description:
            "Implement formal processes for gathering, preserving, and documenting digital and physical evidence related to security incidents in a way that maintains its integrity and supports potential legal proceedings.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP, also add code to get notified whenever a user tries to access a resource they shouldn't, and log it",
      },
    },

    {
      code: ["ISO_27001_5.29", "SOC_2_9.1"],
      name: "Information Security During Disruption",
      category: "Incident Response",
      tests: true, //test DB backup, test AWS lambda functions are running, etc.
      standards: {
        ISO_27001: {
          description:
            "Ensure information security controls remain effective and operational during disruptive events, maintaining the protection of critical assets even in crisis situations.",
        },
        SOC_2: {
          description:
            "The entity identifies, develops, and implements comprehensive activities to recover and restore critical information technology resources during disruptions, with documented procedures for various disaster scenarios.",
          categoryId: "CC9",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },

    {
      code: ["ISO_27001_5.30", "SOC_2_9.1"],
      name: "ICT Readiness for Business Continuity",
      category: "Incident Response",
      tests: true, // db backups,
      standards: {
        ISO_27001: {
          description:
            "Maintain and regularly verify that IT systems and infrastructure are prepared to continue essential operations during business disruptions, with appropriate redundancy and recovery capabilities.",
        },
        SOC_2: {
          description:
            "The entity identifies, develops, and implements comprehensive activities to recover and restore critical information technology resources during disruptions, with documented procedures for various disaster scenarios.",
          categoryId: "CC9",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },
    {
      code: ["ISO_27001_5.31"],
      name: "Legal and Regulatory Compliance",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Establish and maintain a comprehensive system to identify, document, and ensure compliance with all applicable security-related laws, regulations, and contractual obligations, including regular reviews and updates to address changing requirements.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_5.32"],
      name: "Intellectual Property Rights",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Establish and enforce procedures to protect intellectual property rights, including software licensing, patent rights, and proprietary information across all organizational activities.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure"],
    },

    {
      code: ["ISO_27001_5.33"],
      name: "Protection of Records",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Implement comprehensive safeguards to protect organizational records from unauthorized access, alteration, deletion, and ensure their authenticity and accessibility throughout their lifecycle.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },

    {
      code: ["ISO_27001_5.34"],
      name: "Privacy and PII Protection",
      category: "Data & Privacy",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Implement robust controls to protect personal identifiable information (PII) in accordance with data protection laws, privacy regulations, and organizational commitments to data subjects.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["ISO_27001_5.35"],
      name: "Independent Review of Information Security",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Conduct regular independent assessments of the organization's information security program, including evaluation of policies, procedures, and technical controls, especially after significant changes.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["ISO_27001_5.36"],
      name: "Compliance with Policies and Standards",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Establish a systematic process to verify and document compliance with security policies, standards, and procedures across all organizational units and systems.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_5.37"],
      name: "Documented Operating Procedures",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Create, maintain, and distribute clear documentation of all operational procedures for information systems and make them readily available to authorized personnel.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure"],
    },

    // People controls section
    {
      code: ["ISO_27001_6.1", "SOC_2_1.1.3"],
      name: "Personnel Screening",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Conduct thorough background checks on all potential employees before hiring and periodically during employment, considering legal requirements, business needs, and risk levels associated with their access to information.",
        },
        SOC_2: {
          description: "New hires are required to pass a background check as a condition of their employment",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_6.2"],
      name: "Employment Terms and Conditions",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Include clear information security responsibilities and obligations in employment contracts and agreements for both employees and the organization.",
        },
      },
      requiredArtifactTypes: ["policy", "evidence"],
    },

    {
      code: ["ISO_27001_6.3", "SOC_2_1.1.2"],
      name: "Information Security Awareness and Training",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Provide comprehensive security awareness training and regular updates on security policies and procedures to all personnel and relevant third parties, tailored to their specific roles and responsibilities.",
        },
        SOC_2: {
          description:
            "Provide comprehensive security awareness training and regular updates on security policies and procedures to all personnel and relevant third parties, tailored to their specific roles and responsibilities. Posted in a common location, and accessible to all employees. All employees must accept the acceptable use policy upon hire.",
        },
      },
      requiredArtifactTypes: ["policy", "training", "evidence"],
    },

    {
      code: ["ISO_27001_6.4"],
      name: "Disciplinary Process",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Establish and communicate a formal disciplinary process for handling information security policy violations, ensuring consistent and fair treatment of all personnel.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure"],
    },

    {
      code: ["ISO_27001_6.4.2"],
      name: "Physical Security Policy",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Entity has security policies that have been approved by management and detail how physical security for the company's headquarters is maintained. These policies are accessible to all employees and contractors.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure"],
    },

    {
      code: ["ISO_27001_6.5"],
      name: "Post-Employment Responsibilities",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Clearly define and communicate ongoing security obligations and responsibilities that continue after employment ends, ensuring protection of organizational information assets.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure"],
    },

    {
      code: ["SOC_2_6.5.1"],
      name: "Disposal of Hardware",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "Formal policies and procedures are in place to guide personnel in the disposal of hardware containing sensitive data.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure"],
    },

    {
      code: ["ISO_27001_6.6"],
      name: "Confidentiality Agreements",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Develop, maintain, and regularly review confidentiality agreements that protect organizational information, ensuring all relevant parties sign and understand their obligations.",
        },
      },
      requiredArtifactTypes: ["policy", "evidence"],
    },

    {
      code: ["ISO_27001_6.7"],
      name: "Remote Working",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Implement specific security controls and procedures for remote work environments to ensure the same level of information protection as in-office operations.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_6.8"],
      name: "Security Event Reporting",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Establish clear channels and procedures for employees to report security incidents or concerns promptly, ensuring effective response and documentation.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "training"],
    },

    // Physical controls
    {
      code: ["ISO_27001_7.1"],
      name: "Physical Security Perimeters",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Establish and maintain clear physical security boundaries to protect sensitive information assets and processing facilities from unauthorized access.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_7.2", "SOC_2_6.6"],
      name: "Physical Entry Controls",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description: "Secure areas shall be protected by appropriate entry controls and access points.",
        },
        SOC_2: {
          description:
            "Implement comprehensive physical access controls including authentication mechanisms, visitor management, and monitoring systems to prevent unauthorized entry to secure areas.",
          categoryId: "CC6",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["SOC_2_6.6.1"],
      name: "Computer Timeout Lock",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "Ensures that all company-issued computers use a screensaver lock with a timeout of no more than 15 minutes.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure"],
    },

    {
      code: ["SOC_2_6.6.2"],
      name: "Web Application Encryption",
      category: "Data & Privacy",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "All connections to its web application from its users are encrypted.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure"],
    },

    {
      code: ["SOC_2_6.6.3"],
      name: "Physical Security Policy",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "Automatically logs users out after a predefined inactivity interval and/or closure of the internet browser, and requires users to reauthenticate.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure"],
    },
    {
      code: ["SOC_2_6.6.4"],
      name: "SSH Access",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "SSH users use unique accounts to access production machines. Additionally, the use of the Root account is not allowed, and no public SSH is allowed.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure"],
    },

    {
      code: ["SOC_2_6.6.8"],
      name: "Web Application Firewall",
      category: "Infra",
      tests: ["WAF.1"],
      standards: {
        SOC_2: {
          description: "Web Application Firewall (WAF) in place to protect the application from outside threats.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure"],
    },

    {
      code: ["SOC_2_6.6.9"],
      name: "Intrusion Detection System",
      category: "Infra",
      tests: ["IDS.1"],
      standards: {
        SOC_2: {
          description:
            "An intrusion detection system (IDS) is in place to detect potential intrusions, alert personnel when a potential intrusion is detected.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure"],
    },

    {
      code: ["ISO_27001_7.3"],
      name: "Securing Offices, Rooms and Facilities",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Implement appropriate physical security measures for all facilities containing sensitive information or critical systems, including offices, rooms, and support infrastructure.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_7.4", "SOC_2_6.6"],
      name: "Physical Security Monitoring",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Implement continuous monitoring systems and procedures to detect and respond to unauthorized physical access attempts, including surveillance systems, access logs, and regular security patrols where appropriate.",
        },
        SOC_2: {
          description:
            "The entity restricts physical access to facilities and protected information assets through badge access, visitor management, monitoring systems, and environmental controls to prevent unauthorized access.",
          categoryId: "CC6",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },

    {
      code: ["ISO_27001_7.5"],
      name: "Physical and Environmental Threat Protection",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Implement comprehensive protection measures against physical and environmental threats, including natural disasters, power failures, and malicious attacks on infrastructure.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_7.6"],
      name: "Working in Secure Areas",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Establish and enforce comprehensive security protocols for working in secure areas, including access controls, monitoring procedures, and specific work guidelines to protect sensitive assets and information.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure"],
    },

    {
      code: ["ISO_27001_7.7"],
      name: "Clear Desk and Clear Screen",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Implement and enforce clear desk and clear screen policies to protect sensitive information from unauthorized access or exposure during and after working hours, including proper handling of physical documents and digital displays.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "training"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },

    {
      code: ["ISO_27001_7.8"],
      name: "Equipment Siting and Protection",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Position and protect information processing equipment to reduce environmental and security risks, considering factors such as power supply, electromagnetic interference, and unauthorized access.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_7.9"],
      name: "Off-Premises Asset Security",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Implement security controls for assets used outside organizational premises, considering varying risks of working in different locations and ensuring consistent protection regardless of location.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure"],
    },

    {
      code: ["ISO_27001_7.10"],
      name: "Storage Media Management",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Implement comprehensive procedures for managing storage media throughout its lifecycle, including secure handling, transport, storage, and disposal methods aligned with data classification requirements.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },

    {
      code: ["ISO_27001_7.11"],
      name: "Supporting Utilities",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Ensure critical information processing facilities are protected against utility failures through redundant power supplies, backup systems, and regular testing of supporting infrastructure.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_7.12"],
      name: "Cabling Security",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Implement physical protection measures for power and network cabling to prevent interception, interference, or damage, including separation of data and power cables and regular inspection procedures.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_7.13"],
      name: "Equipment Maintenance",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Establish regular maintenance schedules and procedures for all information processing equipment, ensuring proper functioning, integrity, and availability while maintaining security during servicing.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_7.14"],
      name: "Secure Disposal of Equipment",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Implement secure procedures for disposing of or repurposing equipment containing storage media, ensuring complete removal or secure destruction of sensitive information before disposal.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },

    // Technological Controls (section 8.x)
    {
      code: ["ISO_27001_8.1", "SOC_2_6.8.1"],
      name: "User Endpoint Device Security",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Implement comprehensive security controls for all user endpoint devices, including encryption, access controls, malware protection, and secure configuration management to protect information from unauthorized access or compromise.",
        },
        SOC_2: {
          description: "Antivirus software is installed on workstations to protect the network against malware, and the software is kept up to date.",
          categoryId: "CC6",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP for user endpoint device security",
      },
    },

    {
      code: ["ISO_27001_8.2", "SOC_2_6.3"],
      name: "Privileged Access Rights",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Implement strict controls for managing privileged access rights, including detailed monitoring, regular reviews, and minimum necessary access principles to prevent unauthorized use of administrative privileges.",
        },
        SOC_2: {
          description:
            "The entity authorizes, modifies, and removes access to data, software, functions, and other protected information assets based on user roles and responsibilities, employing the principle of least privilege and segregation of incompatible duties.",
          categoryId: "CC6",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP for privileged access rights",
      },
    },

    {
      code: ["ISO_27001_8.3", "SOC_2_6.1"],
      name: "Information Access Restriction",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Establish and enforce granular access control policies that restrict information access based on business requirements, job roles, and security classification levels.",
        },
        SOC_2: {
          description:
            "The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events, employing defense-in-depth strategies and industry-standard practices.",
          categoryId: "CC6",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP for information access restriction",
      },
    },

    {
      code: ["ISO_27001_8.4"],
      name: "Source Code Access Control",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Implement strict access controls for source code, development tools, and software libraries, including version control, code review processes, and secure storage to protect intellectual property.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },

    {
      code: ["ISO_27001_8.5", "SOC_2_6.2"],
      name: "Secure Authentication",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Deploy robust authentication mechanisms including multi-factor authentication, strong password policies, and secure credential management to ensure only authorized users can access systems and data.",
        },
        SOC_2: {
          description:
            "Prior to issuing system credentials and granting system access, the entity registers and authorizes new internal and external users through formal onboarding processes that verify identity and establish appropriate access levels.",
          categoryId: "CC6",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },

    {
      code: ["ISO_27001_8.6"],
      name: "Capacity Management",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Implement proactive monitoring and management of system resources, including CPU, memory, storage, and network capacity, with defined thresholds and scaling procedures to ensure continuous service availability.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_8.7", "SOC_2_6.8"],
      name: "Protection Against Malware",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Deploy comprehensive malware protection across all systems, including real-time scanning, automatic updates, user awareness training, and incident response procedures for malware detection.",
        },
        SOC_2: {
          description:
            "The entity implements multi-layered controls to prevent or detect and respond to the introduction of unauthorized or malicious software, including endpoint protection, network monitoring, and vulnerability management.",
          categoryId: "CC6",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP, also FAQ center",
      },
    },

    {
      code: ["SOC_2_6.8.3"],
      name: "Anomalous Traffic Monitoring",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "Infrastructure logging configured to monitor web traffic and suspicious activity. When anomalous traffic activity is identified, alerts are automatically created, sent to appropriate personnel and resolved, as necessary.",
          categoryId: "CC6",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_8.8"],
      name: "Technical Vulnerability Management",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Maintain a systematic process for identifying, assessing, and remediating technical vulnerabilities, including regular security assessments, patch management, and risk-based prioritization of fixes.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP and automatic scans of day-zero vulnerabilities",
      },
    },

    {
      code: ["ISO_27001_8.9"],
      name: "Configuration Management",
      category: "Access Control",
      tests: true, //aws config,
      standards: {
        ISO_27001: {
          description:
            "Maintain secure baseline configurations for all systems, with regular reviews and automated monitoring to detect and prevent unauthorized changes.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_8.10"],
      name: "Information Deletion",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Implement secure data deletion procedures that ensure complete removal of information when no longer needed, using appropriate methods based on data sensitivity.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },

    {
      code: ["ISO_27001_8.11"],
      name: "Data Masking",
      category: "Access Control",
      tests: true, //test that patient identifiers are masked before sent to third parties
      standards: {
        ISO_27001: {
          description:
            "Apply appropriate data masking techniques to protect sensitive information during processing, testing, and sharing, ensuring compliance with privacy requirements.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },

    {
      code: ["ISO_27001_8.12"],
      name: "Data Leakage Prevention",
      category: "Access Control",
      tests: true, //test that DLP measures are in place for Google Cloud Storage, incident logs, alerts, audit trails,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Implement comprehensive data loss prevention controls across all systems and networks, including content monitoring, encryption, and access controls to prevent unauthorized data exposure.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence:
          "TODO, add PP for sensitive data catagories, specify approved storage locations, prohibit unencrypted data in transit, prohibited actions such as copying to USB drives, personal email, etc.",
      },
    },

    {
      code: ["ISO_27001_8.13"],
      name: "Information Backup",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Maintain regular, secure backups of all critical information, with documented recovery procedures and periodic testing to ensure data can be restored when needed.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["ISO_27001_8.14", "SOC_2_9.1"],
      name: "Redundancy of Information Processing Facilities",
      category: "Infra",
      tests: true, //test that information processing facilities are redundant and meet availability requirements, up-time, replicas, load balancers, network paths have redunancy, point in time recovery,  etc.
      standards: {
        ISO_27001: {
          description:
            "Design and implement redundant processing facilities with automated failover capabilities to ensure continuous operation of critical systems, meeting defined availability requirements through multiple layers of redundancy.",
        },
        SOC_2: {
          description:
            "The entity identifies, develops, and implements comprehensive activities to recover and restore critical information technology resources during disruptions, with documented procedures for various disaster scenarios.",
          categoryId: "CC9",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["ISO_27001_8.15"],
      name: "Logging",
      category: "Infra",
      tests: true, //test that logs are produced, stored, protected and analysed, and that audit logs are retained for at least 90 days
      standards: {
        ISO_27001: {
          description:
            "Implement comprehensive logging systems that capture, securely store, and analyze all relevant security events, system activities, and anomalies, with retention periods aligned with compliance requirements and business needs.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["ISO_27001_8.16", "SOC_2_7.1"],
      name: "Monitoring Activities",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Establish continuous monitoring of networks, systems, and applications using automated tools and defined procedures to detect security events, with clear escalation paths and response protocols for identified anomalies.",
        },
        SOC_2: {
          description:
            "To detect and act upon security events in a timely manner, the entity monitors system capacity, security threats, changing regulatory requirements, and vulnerability assessments through automated tools and manual processes.",
          categoryId: "CC7",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP that defines security events, actions taken, monitoring tools, monitoring frequency, etc.",
      },
    },
    {
      code: ["SOC_2_7.1.1"],
      name: "Code Reviews",
      category: "Product",
      tests: false,
      satisfied: true,
      //TODO: add github actions to test code changes
      standards: {
        SOC_2: {
          description: "Application code changes, code reviews and tests are performed by someone other than the person who made the code change.",
          categoryId: "CC7",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["ISO_27001_8.17"],
      name: "Clock Synchronization",
      category: "Infra",
      tests: true, //test that clocks are synchronized to approved time sources, test server time is in sync with utc
      standards: {
        ISO_27001: {
          description:
            "Maintain accurate time synchronization across all information systems using reliable time sources, ensuring consistent timestamps for security events, audit logs, and forensic analysis.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["ISO_27001_8.18"],
      name: "Use of Privileged Utility Programs",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Strictly control and monitor the use of utility programs that can override system and application controls, limiting access to authorized personnel and maintaining detailed usage logs.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO: add PP for utility programs, and control over them",
      },
    },

    {
      code: ["ISO_27001_8.19"],
      name: "Installation of Software on Operational Systems",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Implement strict controls over software installation on operational systems, including approval processes, security testing, and verification procedures to maintain system integrity.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO: add PP for utility programs, and control over them",
      },
    },

    {
      code: ["ISO_27001_8.20"],
      name: "Networks Security",
      category: "Infra",
      tests: true, //aws has firewall, and network security setup
      standards: {
        ISO_27001: {
          description:
            "Deploy comprehensive network security controls including firewalls, intrusion detection, encryption, and segmentation to protect information assets and maintain secure communication channels.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_8.21"],
      name: "Security of Network Services",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Define, implement, and actively monitor security mechanisms and service levels for all network services, ensuring consistent protection of information in transit and compliance with security requirements.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_8.22", "SOC_2_6.1"],
      name: "Segregation of Networks",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Implement network segmentation to separate different functional areas, security zones, and trust levels, ensuring that sensitive information and critical services are isolated from general network traffic.",
        },
        SOC_2: {
          description:
            "The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events, employing defense-in-depth strategies and industry-standard practices.",
          categoryId: "CC6",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_8.23"],
      name: "Web Filtering",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Deploy comprehensive web filtering solutions to protect users and systems from malicious websites, content, and downloads, including real-time threat detection and automated blocking of known dangerous sources.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP for malware protection, web filtering, and content filtering for entity personnel devices",
      },
      more: "Users with access to the internet are required to use a web filter and advisory software.",
    },
    {
      code: ["ISO_27001_8.25"],
      name: "Secure Development Life Cycle",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Integrate security throughout the entire software development lifecycle, from requirements gathering through deployment and maintenance, with specific security checkpoints and validation at each stage.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence:
          "The organization follows a comprehensive secure development lifecycle that includes security requirements gathering, secure design, secure coding practices, security testing, and secure deployment procedures.",
      },
      more: "Our SDLC includes:\n\
- Planning Phase:\n\
  • Security requirements gathering\n\
  • Threat modeling\n\
  • Risk assessment\n\
\n\
- Design Phase:\n\
  • Security architecture review\n\
  • Design documentation with security controls\n\
  • Third-party component security evaluation\n\
\n\
- Development Phase:\n\
  • Secure coding standards\n\
  • Code review requirements\n\
  • Security testing integration\n\
  • Dependency vulnerability scanning\n\
\n\
- Testing Phase:\n\
  • Security testing (SAST/DAST)\n\
  • Penetration testing\n\
  • Vulnerability assessment\n\
\n\
- Deployment Phase:\n\
  • Security configuration review\n\
  • Pre-deployment security checklist\n\
  • Post-deployment security validation\n\
\n\
- Maintenance Phase:\n\
  • Security monitoring\n\
  • Incident response procedures\n\
  • Regular security updates",
    },

    {
      code: ["ISO_27001_8.26"],
      name: "Application Security Requirements",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Implement controls to protect test data and environments, ensuring proper selection, protection, and handling of test information while maintaining data privacy and security requirements.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "Application Security Requirements Policy and Procedure documentation is maintained and regularly reviewed.",
      },
    },

    {
      code: ["ISO_27001_8.27"],
      name: "Secure System Architecture and Engineering Principles",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Establish and maintain documented security architecture principles that guide system design and implementation, ensuring consistent application of security controls across all development activities.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "Engineering secure systems principles, and documentation is established and applied to any information system development activities.",
      },
    },

    {
      code: ["ISO_27001_8.28"],
      name: "Secure Coding",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Implement and enforce secure coding standards and practices across all development teams, including code review processes, security testing requirements, and vulnerability prevention guidelines.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_8.29"],
      name: "Security Testing in Development",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Integrate comprehensive security testing throughout the development lifecycle, including automated scanning, penetration testing, and vulnerability assessments with clear remediation processes.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_8.30"],
      name: "Outsourced Development Is Restricted",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Establish strict oversight and control mechanisms for outsourced development activities, including security requirements, code review processes, and regular assessment of vendor security practices.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_8.31"],
      name: "Separation of Environments",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Maintain strict separation between development, testing, and production environments with appropriate access controls and data handling procedures to prevent unauthorized changes and protect sensitive information.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_8.32", "SOC_2_8.1"],
      name: "Change Management",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Implement a comprehensive change management system that includes security impact assessment, testing requirements, approval processes, and rollback procedures for all system and infrastructure changes.",
        },
        SOC_2: {
          description:
            "The entity authorizes, designs, develops, configures, documents, tests, approves, and securely implements changes to infrastructure, data, software, and procedures through a formalized change management process with appropriate segregation of duties.",
          categoryId: "CC8",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_8.33"],
      name: "Test Information Protection",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Implement controls to protect test data and environments, ensuring proper selection, protection, and handling of test information while maintaining data privacy and security requirements.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["ISO_27001_8.34"],
      name: "Protection During Audit Testing",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        ISO_27001: {
          description:
            "Establish formal procedures for conducting security audits and testing, including protection of systems under test, coordination with stakeholders, and minimizing impact on operational systems.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    // Add these new controls to the controls array
    {
      code: ["EC2.13"],
      name: "Security Group SSH Access",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "Security groups should not allow ingress from 0.0.0.0/0 or ::/0 to port 22",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["EC2.2"],
      name: "VPC Default Security Groups",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "VPC default security groups should not allow inbound or outbound traffic",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["S3.1"],
      name: "S3 Public Access Blocks",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "S3 general purpose buckets should have block public access settings enabled",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["S3.7"],
      name: "S3 Cross-Region Replication",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "S3 general purpose buckets should use cross-Region replication",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["Lambda.3"],
      name: "Lambda VPC Configuration",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "Lambda functions should be in a VPC",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["CodeBuild.1"],
      name: "CodeBuild Repository Security",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "CodeBuild Bitbucket source repository URLs should not contain sensitive credentials",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["CodeBuild.2"],
      name: "CodeBuild Environment Variables",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "CodeBuild project environment variables should not contain clear text credentials",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["Config.1"],
      name: "AWS Config Service Role",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "AWS Config should be enabled and use the service-linked role for resource recording",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["DMS.1"],
      name: "DMS Instance Privacy",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "Database Migration Service replication instances should not be public",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["EC2.1"],
      name: "EBS Snapshot Privacy",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "EBS snapshots should not be publicly restorable",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["ES.2"],
      name: "Elasticsearch Domain Privacy",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "Elasticsearch domains should not be publicly accessible",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["IAM.6"],
      name: "Root User Hardware MFA",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "Hardware MFA should be enabled for the root user",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["IAM.9"],
      name: "Root User MFA",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "MFA should be enabled for the root user",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["Lambda.1"],
      name: "Lambda Function Access",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "Lambda function policies should prohibit public access",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["Opensearch.2"],
      name: "OpenSearch Domain Privacy",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "OpenSearch domains should not be publicly accessible",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["RDS.1"],
      name: "RDS Snapshot Privacy",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "RDS snapshot should be private",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["RDS.2"],
      name: "RDS Instance Privacy",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "RDS DB Instances should prohibit public access, as determined by the PubliclyAccessible configuration",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["Redshift.1"],
      name: "Redshift Cluster Privacy",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "Amazon Redshift clusters should prohibit public access",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["S3.2"],
      name: "S3 Public Read Access",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "S3 general purpose buckets should block public read access",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["S3.3"],
      name: "S3 Public Write Access",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "S3 general purpose buckets should block public write access",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["CloudTrail.3"],
      name: "CloudTrail Trail Enablement",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "At least one CloudTrail trail should be enabled",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["GuardDuty.1"],
      name: "GuardDuty Enablement",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "GuardDuty should be enabled",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["IAM.1"],
      name: "IAM Administrative Privileges",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "IAM policies should not allow full * administrative privileges",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SSM.2"],
      name: "Systems Manager Patch Compliance",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "EC2 instances managed by Systems Manager should have a patch compliance status of COMPLIANT after a patch installation",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SageMaker.1"],
      name: "SageMaker Internet Access",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "Amazon SageMaker notebook instances should not have direct internet access",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["CloudTrail.2"],
      name: "CloudTrail Encryption",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "CloudTrail should have encryption at-rest enabled",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["EC2.6"],
      name: "VPC Flow Logging",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "VPC flow logging should be enabled in all VPCs",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["ELB.1"],
      name: "ALB HTTPS Redirection",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "Application Load Balancer should be configured to redirect all HTTP requests to HTTPS",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["ES.1"],
      name: "Elasticsearch Encryption",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "Elasticsearch domains should have encryption at-rest enabled",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["IAM.10"],
      name: "IAM Password Policy",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "Password policies for IAM users should have strong configurations",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["IAM.19"],
      name: "IAM User MFA",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "MFA should be enabled for all IAM users",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["IAM.8"],
      name: "IAM Credential Management",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "Unused IAM user credentials should be removed",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["KMS.4"],
      name: "KMS Key Rotation",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "AWS KMS key rotation should be enabled",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["Opensearch.1"],
      name: "OpenSearch Encryption",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "OpenSearch domains should have encryption at rest enabled",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["S3.5"],
      name: "S3 SSL Requirements",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "S3 general purpose buckets should require requests to use SSL",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SSM.1"],
      name: "Systems Manager EC2 Management",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "EC2 instances should be managed by AWS Systems Manager",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["AutoScaling.1"],
      name: "Auto Scaling Health Checks",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "Auto scaling groups associated with a load balancer should use ELB health checks",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["CloudTrail.4"],
      name: "CloudTrail Log Validation",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "CloudTrail log file validation should be enabled",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["CloudTrail.5"],
      name: "CloudTrail CloudWatch Integration",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "CloudTrail trails should be integrated with Amazon CloudWatch Logs",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["CloudWatch.1"],
      name: "Root User Monitoring",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "A log metric filter and alarm should exist for usage of the root user",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["EC2.12"],
      name: "EC2 EIP Management",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "Unused EC2 EIPs should be removed",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["IAM.2"],
      name: "IAM User Policy Management",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "IAM users should not have IAM policies attached",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SSM.3"],
      name: "Systems Manager Association Compliance",
      category: "Infra",
      tests: true,
      standards: {
        PCI_DSS_3_2_1: {
          description: "EC2 instances managed by Systems Manager should have an association compliance status of COMPLIANT",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_1.1.5"],
      name: "Code of Conduct",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity has a formal code of conduct approved by management and accessible to all employees. All employees must accept the code of conduct upon hire.",
          categoryId: "CC1",
        },
      },
      requiredArtifactTypes: ["policy", "training", "evidence"],
    },
    {
      code: ["SOC_2_1.1.6"],
      name: "Data Protection Policy",
      category: "Data & Privacy",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity has established a data protection policy and requires all employees to accept it upon hire. Management monitors employees' acceptance of the policy.",
          categoryId: "CC1",
        },
      },
      requiredArtifactTypes: ["policy", "training", "evidence"],
    },
    {
      code: ["SOC_2_1.2.1"],
      name: "Board Cybersecurity Oversight",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The company's board of directors or a relevant subcommittee is briefed by senior management at least annually on the state of the company's cybersecurity and privacy risk. The board provides feedback and direction to management as needed.",
          categoryId: "CC1",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_1.2.2"],
      name: "Board Internal Control Charter",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "The company's board of directors has a documented charter that outlines its oversight responsibilities for internal control.",
          categoryId: "CC1",
        },
      },
      requiredArtifactTypes: ["policy", "evidence"],
    },
    {
      code: ["SOC_2_1.2.3"],
      name: "Board Information Security Expertise",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The company's board members have sufficient expertise to oversee management's ability to design, implement and operate information security controls. The board engages third-party information security experts and consultants as needed.",
          categoryId: "CC1",
        },
      },
      requiredArtifactTypes: ["policy", "evidence"],
    },
    {
      code: ["SOC_2_1.2.4"],
      name: "Board Meetings and Independence",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The company's board of directors meets at least annually and maintains formal meeting minutes. The board includes directors that are independent of the company.",
          categoryId: "CC1",
        },
      },
      requiredArtifactTypes: ["policy", "evidence"],
    },
    {
      code: ["SOC_2_1.2.5", "SOC_2_3.1"],
      name: "Risk Assessment Process",
      category: "Risk Management",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity conducts a risk assessment at least annually to identify and assess risks relating to objectives, considering both internal and external factors that could impact goal achievement.",
          categoryId: "CC3",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_1.2.7"],
      name: "External Penetration Testing",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity engages with third-party to conduct penetration tests of the production environment at least annually. Results are reviewed by management and high priority findings are tracked to resolution.",
          categoryId: "CC1",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["INT_PEN_TEST"],
      name: "Internal Penetration Testing",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        Internal: {
          description:
            "The entity conducts internal penetration testing of the production environment at least annually and as needed for major version upgrades. Results are reviewed by management and high priority findings are tracked to resolution.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_1.2.8"],
      name: "Security Policy Review",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "Management reviews security policies on an annual basis to ensure they remain appropriate and aligned with business objectives and security requirements.",
          categoryId: "CC1",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_1.2.9"],
      name: "Security Team Establishment",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity has an assigned security team that is responsible for the design, implementation, management, and review of the organization's security policies, standards, baselines, procedures, and guidelines.",
          categoryId: "CC1",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_1.2.10"],
      name: "Independent Board Members",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "At least one member of the board of directors is independent of management to ensure objective oversight of the entity's internal control.",
          categoryId: "CC1",
        },
      },
      requiredArtifactTypes: ["policy", "evidence"],
    },
    {
      code: ["SOC_2_1.2.11"],
      name: "Information Security Roles and Responsibilities",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "Management has established defined roles and responsibilities to oversee implementation of the information security policy across the organization.",
          categoryId: "CC1",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_1.3.1"],
      name: "Organizational Structure Review",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity reviews its organizational structure, reporting lines, authorities, and responsibilities in terms of information security on an annual basis.",
          categoryId: "CC1",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_1.4.1"],
      name: "Employee Performance Evaluation",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity evaluates the performance of all employees through a formal, annual performance evaluation process to ensure competency and alignment with entity objectives.",
          categoryId: "CC1",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_1.4.2"],
      name: "Employee Recruitment Process",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity's new hires and/or internal transfers are required to go through an official recruiting process during which their qualifications and experience are screened to ensure that they are competent and capable of fulfilling their responsibilities.",
          categoryId: "CC1",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_1.4.3"],
      name: "Job Description Requirements",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "All entity positions have a detailed job description that lists qualifications, such as requisite skills and experience, which candidates must meet in order to be hired by the entity.",
          categoryId: "CC1",
        },
      },
      requiredArtifactTypes: ["policy", "evidence"],
    },
    {
      code: ["SOC_2_1.4.4"],
      name: "Information Security Awareness and Training",
      category: "Organizational",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity has established training programs for privacy and information security to help employees understand their obligations and responsibilities to comply with the entity's security policies and procedures, including the identification and reporting of incidents. All full-time employees are required to complete the training upon hire and annually thereafter.",
          categoryId: "CC1",
        },
      },
      requiredArtifactTypes: ["policy", "training", "evidence"],
    },
    {
      code: ["SOC_2_1.4.5", "SOC_2_9.2"],
      name: "Vendor Risk Management",
      category: ["Risk Management", "Vendor Management"],
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity has a defined vendor management policy that establishes requirements of ensuring third-party entities meet the organization's data preservation and protection requirements. The entity assesses and manages risks associated with vendors and business partners through formal due diligence processes, contractual requirements, ongoing monitoring, and periodic reassessment of third-party relationships.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "TODO, add PP",
      },
    },
    {
      code: ["SOC_2_2.1.1"],
      name: "System Architecture Documentation",
      category: ["Infra", "Organizational"],
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity maintains an accurate architectural diagram to document system boundaries to support the functioning of internal control.",
          categoryId: "CC2",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_2.1.2"],
      name: "Asset Management Policy",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "The entity has a defined policy that establishes requirements for the proper management and tracking of organizational assets.",
          categoryId: "CC2",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_2.1.3"],
      name: "Control Self-Assessment",
      category: "Risk Management",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity performs control self-assessments at least annually to gain assurance that controls are in place and operating effectively. Corrective actions are taken based on relevant findings.",
          categoryId: "CC2",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_2.1.4"],
      name: "Continuous Security Monitoring",
      category: "Risk Management",
      tests: true,
      standards: {
        SOC_2: {
          description: "The entity conducts continuous monitoring of security controls using specialized tools, and addresses issues in a timely manner.",
          categoryId: "CC2",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },

    {
      code: ["SOC_2_2.1.5", "ISO_27001_8.24"],
      name: "Use of Cryptography",
      category: "Infra",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "The entity has an established policy and procedures that governs the use of cryptographic controls.",
          categoryId: "CC2",
        },
        ISO_27001: {
          description:
            "Establish and maintain a comprehensive cryptography policy that defines standards for encryption algorithms, key management, and secure implementation across all systems and data types, ensuring appropriate protection of sensitive information.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence:
          "Cryptographic controls are implemented across all systems handling sensitive data. This includes encryption at rest using AES-256 and TLS 1.3 for data in transit.",
      },
      more: "We implement industry-standard cryptographic controls including: \n\
- Data at rest: AES-256 encryption\n\
- Data in transit: TLS 1.3\n\
- Key management: AWS KMS for key generation, storage, and rotation\n\
- Password hashing: Argon2id with appropriate memory and CPU cost parameters\n\
- Certificate management: Automated with regular rotation\n\
- Hardware security modules (HSMs) for critical key storage",
    },
    {
      code: ["SOC_2_2.1.6"],
      name: "Customer Data Access Policies",
      category: ["Data & Privacy", "Policies"],
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity management has approved all policies that detail how customer data may be made accessible and should be handled. These policies are accessible to all employees and contractors.",
          categoryId: "CC2",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_2.1.7"],
      name: "Information Security Policy",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity has a defined information security policy that covers policies and procedures to support the functioning of internal control.",
          categoryId: "CC2",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_2.1.8"],
      name: "Least Privilege Access",
      category: "Access Control",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description:
            "The entity authorizes access to information resources, including data and the systems that store or process sensitive data, based on the principle of least privilege.",
          categoryId: "CC2",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
    },
    {
      code: ["SOC_2_2.1.9", "ISO_27001_5.9"],
      name: "IT Asset Management",
      category: "Policies",
      tests: false,
      satisfied: true,
      standards: {
        SOC_2: {
          description: "The entity identifies, inventories, classifies, and assigns owners to IT assets.",
          categoryId: "CC2",
        },
        ISO_27001: {
          description: "Maintain a complete and current inventory of all information assets and their owners.",
        },
      },
      requiredArtifactTypes: ["policy", "procedure", "evidence"],
      artifacts: {
        evidence: "Inventory of information assets is maintained and regularly reviewed.",
      },
    },
  ],
};
