// https://codesandbox.io/s/blov5kowy?file=/index.js:0-1633

import * as React from 'react';
import styles from './MatrixEditor.module.scss';
import { MatrixEditorProps } from './MatrixEditor.props';
import { Button, ButtonGroup, NumberInput, WithLabel } from 'components';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { SimulationDimension } from 'types/types';

// import DragAndDrop from './DragAndDrop';

import EditorCanvas from './EditorCanvas';
import {
  ConfigMaterial,
  selectConfigMaterialSet,
  selectCurrentMaterialMatrixConfigInSet,
  selectMaterialMatrixCountCol,
  selectMaterialMatrixCountRow,
  selectMaterials,
  setCurrentMaterialMatrix,
  setMaterialMatrixSize,
  updateMaterialEps,
  updateMaterialMu,
  updateMaterialSigma,
} from 'store/reducers/material-matrix.reducer';
import PreviewMatrix from './PreviewMatrixEditor';
import { selectCurrentSimulationDimension } from 'store/reducers/app-config.reducer';
import { colors } from './colors';

const gridSizes1D = [5, 50, 100, 200];
const gridSizes2D = [11, 55, 110, 220];

const MatrixEditor: React.FC<MatrixEditorProps> = ({
  setIsOpened,
  srcPositionRelativeX,
  srcPositionRelativeY,
}) => {
  const [currentMatrixSizeIndex, setCurrentMatrixSizeIndex] = React.useState(1);

  const dispatch = useAppDispatch();
  const currentSimulationDimension = useAppSelector(
    selectCurrentSimulationDimension
  );

  const materials = useAppSelector(selectMaterials);

  const currentMaterialMatrixConfigInSet = useAppSelector(
    selectCurrentMaterialMatrixConfigInSet
  );

  const countRow = useAppSelector(selectMaterialMatrixCountRow);
  const countCol = useAppSelector(selectMaterialMatrixCountCol);

  // Handlers.
  const resetMatrix = (currentSimulationDimension: SimulationDimension) => {
    dispatch(setCurrentMaterialMatrix({ currentMaterialMatrixConfigInSet: 0 }));
  };

  const previewMaterialConfigHandler = (materialMatrixConfigInSet: number) => {
    dispatch(
      setCurrentMaterialMatrix({
        currentMaterialMatrixConfigInSet: materialMatrixConfigInSet,
      })
    );
  };

  const [currentMaterial, setCurrentMaterial] = React.useState(1);

  const configMaterialSet: ConfigMaterial[] = useAppSelector(
    selectConfigMaterialSet
  );


  return (
    <>
      <div className={styles.substrate}></div>

      <div className={styles.modalWrapper}>
        <div className={styles.matrixPicker}>
          <h2 className={styles.title}>Matrix picker</h2>
          <hr />
          <div className={styles.scrollPanel}>
            {configMaterialSet.map((material, index) => (
              <>
                <div
                  onClick={() => previewMaterialConfigHandler(index)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <h4>{material.name}</h4>
                  <div style={{ width: 280 }}>
                    <PreviewMatrix
                      key={index + material.simulationDimension}
                      simulationDimension={material.simulationDimension}
                      materialMatrix={material.materialMatrix}
                      srcPositionRelativeX={srcPositionRelativeX}
                      srcPositionRelativeY={srcPositionRelativeY}
                    />
                  </div>
                </div>
                <hr />
              </>
            ))}
          </div>
        </div>
        <div className={styles.editor}>
          <h2 className={styles.title}>Material editor</h2>
          {/* Editor start */}
          <hr />
          <EditorCanvas
            width={400}
            height={400}
            currentMaterial={currentMaterial}
            srcPositionRelativeX={srcPositionRelativeX}
            srcPositionRelativeY={srcPositionRelativeY}
          />
          {/* Editor end */}

          <div className={styles.buttons}>
            <WithLabel labelText='Choose matrix size:'>
              <ButtonGroup activeButton={currentMatrixSizeIndex}>
                {currentSimulationDimension ===
                SimulationDimension.SIMULATION_1D
                  ? gridSizes1D.map((size, index) => {
                      return (
                        <button
                          key={size}
                          onClick={() => {
                            setCurrentMatrixSizeIndex(index);
                            dispatch(
                              setMaterialMatrixSize({
                                newCountRow: 1,
                                newCountCol: size,
                              })
                            );
                            dispatch(
                              setCurrentMaterialMatrix({
                                currentMaterialMatrixConfigInSet,
                              })
                            );
                          }}
                        >
                          {size}
                        </button>
                      );
                    })
                  : gridSizes2D.map((size, index) => {
                      return (
                        <button
                          key={size}
                          onClick={() => {
                            setCurrentMatrixSizeIndex(index);
                            dispatch(
                              setMaterialMatrixSize({
                                newCountRow: size,
                                newCountCol: size,
                              })
                            );
                            dispatch(
                              setCurrentMaterialMatrix({
                                currentMaterialMatrixConfigInSet,
                              })
                            );
                          }}
                        >
                          {size}
                        </button>
                      );
                    })}
              </ButtonGroup>
            </WithLabel>
            <hr />

            <Button
              style={{ marginTop: '.61rem' }}
              onClick={() => setIsOpened(false)}
            >
              Back to Simulation
            </Button>
          </div>
        </div>

        <div className={styles.materialPicker}>
          <h2 className={styles.title}>Material picker</h2>

          <hr />
          <div className={styles.scrollPanel}>
            {materials.map((material, index) => {
              return (
                <>
                <div className={styles.oneMaterialPanel} key={index}>
                  <div className={styles.material}>
                    <svg
                      onClick={() => setCurrentMaterial(index)}
                      width={'65px'}
                      height={'65px'}
                      style={{
                        background: colors[index],
                        border: `${
                          index == currentMaterial ? '8' : '0'
                        }px solid rgba(0,0,0,0.35)`,
                      }}
                    />
                    <h3>{material.name}</h3>
                  </div>
                  <hr />
                  <div className={styles.materialNumberInputs}>
                    <NumberInput
                      value={material.eps}
                      label={'permittivity'}
                      onChange={(e) =>
                        dispatch(
                          updateMaterialEps({
                            materialId: material.id,
                            newEps: +e.target.value,
                          })
                        )
                      }
                    />
                    <NumberInput
                      value={material.mu}
                      label={'permiability'}
                      onChange={(e) =>
                        dispatch(
                          updateMaterialMu({
                            materialId: material.id,
                            newMu: +e.target.value,
                          })
                        )
                      }
                    />
                    <NumberInput
                      value={material.sigma}
                      label={'conductivity'}
                      onChange={(e) => {
                        dispatch(
                          updateMaterialSigma({
                            materialId: material.id,
                            newSigma: +e.target.value,
                          })
                        )
                       
                      }
                      }
                    />
                  </div>
                  <hr />
                  <hr />
                  <hr />
                </div>
                </>
              );
            })}
          </div>
        </div>
        {/* <DragAndDrop WIDTH={400} HEIGHT={400} /> */}
      </div>
    </>
  );
};

export default MatrixEditor;