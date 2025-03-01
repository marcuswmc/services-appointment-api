import ProfessionalModel, { IProfessional } from "../models/professionalModel";

class ProfessionalService {
  getAll = async (): Promise<IProfessional[]> => {
    return await ProfessionalModel.find().populate("services");
  };

  getById = async (id: string): Promise<IProfessional | null> => {
    return await ProfessionalModel.findById(id).populate("services");
  };

  create = async (data: IProfessional): Promise<IProfessional> => {
    return await ProfessionalModel.create(data);
  };

  update = async (id: string, data: Partial<IProfessional>): Promise<IProfessional | null> => {
    return await ProfessionalModel.findByIdAndUpdate(id, data, { new: true });
  };

  delete = async (id: string): Promise<IProfessional | null> => {
    return await ProfessionalModel.findByIdAndDelete(id);
  };
}

export default new ProfessionalService();
